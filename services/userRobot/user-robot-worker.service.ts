import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { Job } from "bull";
import { cpz } from "../../@types";
import UserRobot from "../../state/userRobot/userRobot";

class UserRobotWorkerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.USER_ROBOT_WORKER,
      dependencies: [
        cpz.Service.DB_ROBOTS,
        cpz.Service.DB_USER_ROBOTS,
        cpz.Service.DB_USER_ROBOT_JOBS,
        cpz.Service.DB_USER_POSITIONS,
        cpz.Service.DB_USER_ORDERS,
        cpz.Service.PRIVATE_CONNECTOR_RUNNER
      ],
      mixins: [
        QueueService({
          redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS && {}
          },
          settings: {
            lockDuration: 20000,
            lockRenewTime: 5000,
            stalledInterval: 30000,
            maxStalledCount: 10
          }
        })
      ],
      queues: {
        [cpz.Queue.runUserRobot]: {
          concurrency: 100,
          async process(job: Job) {
            await this.processJobs(job.id);
            return { success: true, id: job.id };
          }
        }
      }
    });
  }

  async processJobs(userRobotId: string) {
    try {
      this.logger.info(`User Robot #${userRobotId} started processing jobs`);
      let [nextJob]: cpz.UserRobotJob[] = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOT_JOBS}.find`,
        {
          limit: 1,
          sort: "created_at",
          query: {
            userRobotId
          }
        }
      );
      if (nextJob) {
        while (nextJob) {
          let status = await this.run(nextJob);
          if (status) {
            try {
              await this.broker.call(
                `${cpz.Service.DB_USER_ROBOT_JOBS}.remove`,
                {
                  id: nextJob.id
                }
              );
            } catch (e) {
              this.logger.error("Failed to delete job", nextJob, e);
            }
            if (status === cpz.Status.started) {
              [nextJob] = await this.broker.call(
                `${cpz.Service.DB_USER_ROBOT_JOBS}.find`,
                {
                  limit: 1,
                  sort: "created_at",
                  query: {
                    userRobotId
                  }
                }
              );
            }
          } else {
            nextJob = null;
          }
        }
      }
      this.logger.info(`User robot #${userRobotId} finished processing jobs`);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async run(job: cpz.UserRobotJob) {
    const { type, userRobotId, data } = job;
    this.logger.info(
      `User robot #${userRobotId} processing '${type}' job (${job.id})`
    );
    try {
      const userRobotState: cpz.UserRobotState = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.getState`,
        { id: userRobotId }
      );
      if (!userRobotState)
        throw new Error(`User robot ${userRobotId} not found.`);
      const userRobot = new UserRobot(userRobotState);
      userRobot._log = this.logger.info.bind(this);
      if (type === cpz.UserRobotJobType.signal) {
        userRobot.handleSignal(<cpz.SignalEvent>data);
      } else if (type === cpz.UserRobotJobType.order) {
        userRobot.handleOrder(<cpz.Order>data);
      } else if (type === cpz.UserRobotJobType.stop) {
        // Stop robot
        if (
          userRobot.status === cpz.Status.stopping ||
          userRobot.status === cpz.Status.stopped
        )
          return userRobot.status;
        userRobot.stop(<{ message?: string }>data);
      } else if (type === cpz.UserRobotJobType.pause) {
        // Pause robot
        if (
          userRobot.status === cpz.Status.paused ||
          userRobot.status === cpz.Status.stopped
        )
          return userRobot.status;
        userRobot.pause(<{ message?: string }>data);
      } else {
        throw new Error(`Unknown type "${type}"`);
      }

      if (
        userRobot.status === cpz.Status.stopping &&
        !userRobot.hasActivePositions
      ) {
        userRobot.setStop();
        this.logger.info(`User Robot #${userRobot.id} stopped!`);
      }

      // Saving  user robot positions
      if (
        userRobot.state.positions &&
        Array.isArray(userRobot.state.positions) &&
        userRobot.state.positions.length > 0
      ) {
        await this.broker.call(`${cpz.Service.DB_USER_POSITIONS}.upsert`, {
          entities: userRobot.state.positions
        });

        if (userRobot.hasClosedPositions) {
          this.logger.info(
            `User Robot #${userRobot.state.userRobot.id} has closed positions, sending ${cpz.Event.STATS_CALC_USER_ROBOT} event.`
          );
          const { id } = userRobot.state.userRobot;
          await this.broker.emit<cpz.StatsCalcUserRobotEvent>(
            cpz.Event.STATS_CALC_USER_ROBOT,
            {
              userRobotId: id
            }
          );
        }

        if (
          userRobot.state.recentTrades &&
          Array.isArray(userRobot.state.recentTrades) &&
          userRobot.state.recentTrades.length > 0
        ) {
          for (const trade of userRobot.state.recentTrades) {
            await this.broker.emit<cpz.UserTradeEventData>(
              cpz.Event.USER_ROBOT_TRADE,
              trade
            );
          }
        }
      }

      if (
        userRobot.state.ordersToCreate &&
        Array.isArray(userRobot.state.ordersToCreate) &&
        userRobot.state.ordersToCreate.length > 0
      ) {
        await this.broker.call<Promise<void>, { entities: cpz.Order[] }>(
          `${cpz.Service.DB_USER_ORDERS}.insert`,
          {
            entities: userRobot.state.ordersToCreate
          }
        );
      }

      if (
        userRobot.state.connectorJobs &&
        Array.isArray(userRobot.state.connectorJobs) &&
        userRobot.state.connectorJobs.length > 0
      ) {
        for (const job of userRobot.state.connectorJobs) {
          await this.broker.call<Promise<void>, cpz.ConnectorJob>(
            `${cpz.Service.PRIVATE_CONNECTOR_RUNNER}.addJob`,
            job
          );
        }
      }

      // Saving robot state
      await this.broker.call<Promise<void>, cpz.UserRobotDB>(
        `${cpz.Service.DB_USER_ROBOTS}.update`,
        userRobot.state.userRobot
      );
      // Sending robot events
      if (userRobot.state.eventsToSend.length > 0) {
        for (const { type, data } of userRobot.state.eventsToSend) {
          await this.broker.emit(type, data);
        }
      }

      return userRobot.status;
    } catch (e) {
      this.logger.error(e, job);
      await this.broker.emit(cpz.Event.USER_ROBOT_FAILED, {
        userRobotId,
        jobType: type,
        error: e.message
      });
    }
  }
}

export = UserRobotWorkerService;

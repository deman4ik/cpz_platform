import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { Job } from "bull";
import { cpz } from "../../@types";
import { sortAsc } from "../../utils";
import { v4 as uuid } from "uuid";
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
        cpz.Service.DB_USER_ORDERS
      ],
      mixins: [
        QueueService({
          redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS
          },
          settings: {
            lockDuration: 20000,
            lockRenewTime: 5000,
            stalledInterval: 30000,
            maxStalledCount: 1
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
          await this.broker.call(`${cpz.Service.DB_USER_ROBOT_JOBS}.remove`, {
            id: nextJob.id
          });
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
    this.logger.info(`User robot #${userRobotId} processing '${type}' job`);
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
        userRobot.stop();
      } else if (type === cpz.UserRobotJobType.pause) {
        // Pause robot
        userRobot.pause();
      } else {
        throw new Error(`Unknown type "${type}"`);
      }

      const state = userRobot.state;

      // Saving  user robot positions
      if (
        state.positions &&
        Array.isArray(state.positions) &&
        state.positions.length > 0
      ) {
        await this.broker.call(`${cpz.Service.DB_USER_POSITIONS}.upsert`, {
          entities: state.positions
        });
      }

      if (
        state.ordersToCreate &&
        Array.isArray(state.ordersToCreate) &&
        state.ordersToCreate.length > 0
      ) {
        await this.broker.call(`${cpz.Service.DB_USER_ORDERS}.insert`, {
          entities: state.ordersToCreate
        });
      }

      if (
        state.ordersWithJobs &&
        Array.isArray(state.ordersWithJobs) &&
        state.ordersWithJobs.length > 0
      ) {
        for (const order of state.ordersWithJobs) {
          await this.broker.call(`${cpz.Service.DB_USER_ORDERS}.update`, order);
          await this.broker.call(
            `${cpz.Service.PRIVATE_CONNECTOR_RUNNER}.addJob`,
            {
              userExAccId: order.userExAccId,
              type: cpz.ConnectorJobType.order
            }
          );
        }
      }

      // Saving robot state
      await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.update`,
        state.userRobot
      );
      // Sending robot events
      if (state.eventsToSend.length > 0) {
        for (const { type, data } of state.eventsToSend) {
          await this.broker.emit(type, data);
        }
      }

      return userRobot.status;
    } catch (e) {
      this.logger.error(e);
      await this.broker.emit(cpz.Event.USER_ROBOT_FAILED, {
        userRobotId,
        jobType: type,
        error: e
      });
    }
  }
}

export = UserRobotWorkerService;

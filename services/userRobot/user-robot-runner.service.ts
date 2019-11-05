import { Service, ServiceBroker, Context } from "moleculer";
import { v4 as uuid } from "uuid";
import { cpz } from "../../@types";
import { JobId } from "bull";
import QueueService from "moleculer-bull";
import dayjs from "../../lib/dayjs";
import Timeframe from "../../utils/timeframe";
import { CANDLES_RECENT_AMOUNT } from "../../config";
import Auth from "../../mixins/auth";

class UserRobotRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.USER_ROBOT_RUNNER,
      dependencies: [
        cpz.Service.DB_USER_ROBOTS,
        cpz.Service.DB_USER_POSITIONS,
        cpz.Service.DB_USER_ORDERS
      ],
      mixins: [
        Auth,
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
      actions: {
        start: {
          params: {
            id: "string"
          },
          graphql: {
            mutation: "userRobotStart(id: ID!): ServiceStatus!"
          },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: "authAction"
          },
          handler: this.start
        },
        stop: {
          params: {
            id: "string"
          },
          graphql: {
            mutation: "userRobotStop(id: ID!): ServiceStatus!"
          },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: "authAction"
          },
          handler: this.stop
        },
        pause: {
          graphql: {
            mutation: "userRobotPause(id: ID): Response!"
          },
          params: {
            id: { type: "string", optional: true }
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.pause
        },
        resume: {
          graphql: {
            mutation: "userRobotResume(id: ID): Response!"
          },
          params: {
            id: { type: "string", optional: true }
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.resume
        }
      },
      events: {
        [cpz.Event.ORDER_STATUS]: this.handleOrder,
        [cpz.Event.SIGNAL_TRADE]: this.handleSignalTrade
      },
      started: this.startedService
    });
  }

  async jobCompleted(jobID: JobId, res: any) {
    this.logger.info(`User Robot #${jobID} completed job`);
  }

  async jobError(error: Error) {
    this.logger.error(error);
  }

  async startedService() {
    await this.getQueue(cpz.Queue.runUserRobot).on(
      "global:completed",
      this.jobCompleted.bind(this)
    );
    await this.getQueue(cpz.Queue.runUserRobot).on(
      "error",
      this.jobError.bind(this)
    );
    await this.getQueue(cpz.Queue.runUserRobot).on(
      "fail",
      this.jobError.bind(this)
    );
  }

  async queueJob(job: cpz.UserRobotJob, status: string) {
    await this.broker.call(`${cpz.Service.DB_USER_ROBOT_JOBS}.upsert`, {
      entity: job
    });
    const { userRobotId } = job;
    if (status === cpz.Status.started)
      await this.createJob(cpz.Queue.runUserRobot, job, {
        jobId: userRobotId,
        removeOnComplete: true,
        removeOnFail: true
      });
  }

  async start(
    ctx: Context<{
      id: string;
    }>
  ) {
    const { id } = ctx.params;
    try {
      const { status } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.get`,
        {
          id
        }
      );
      if (status === cpz.Status.paused) {
        const result = await this.resume(ctx);
        if (result && result.success)
          return { success: true, id, status: cpz.Status.started };
        else throw result.error;
      }
      if (status === cpz.Status.started || status === cpz.Status.stopping)
        return {
          success: true,
          id,
          status
        };

      await this.broker.call(`${cpz.Service.DB_USER_ROBOTS}.update`, {
        id,
        status: cpz.Status.started,
        startedAt: dayjs.utc().toISOString(),
        error: null,
        stoppedAt: null,
        latestSignal: null,
        statistics: {},
        equity: {}
      });

      return { success: true, id, status: cpz.Status.started };
    } catch (e) {
      this.logger.error(e);
      return { success: false, id: ctx.params.id, error: e };
    }
  }

  async stop(
    ctx: Context<{
      id: string;
    }>
  ) {
    const { id } = ctx.params;
    try {
      const { status } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.get`,
        {
          id
        }
      );
      if (status === cpz.Status.stopping || status === cpz.Status.stopped)
        return {
          success: true,
          id,
          status
        };

      await this.queueJob(
        {
          id: uuid(),
          userRobotId: id,
          type: cpz.UserRobotJobType.stop
        },
        status
      );
      return {
        success: true,
        id,
        status: cpz.Status.stopping
      };
    } catch (e) {
      this.logger.error(e);
      return { success: false, id: ctx.params.id, error: e };
    }
  }

  async pause(
    ctx: Context<{
      id: string;
    }>
  ) {
    try {
      const { id } = ctx.params;
      let userRobotsToPause: { id: string; status: string }[] = [];
      if (id) {
        const { status } = await this.broker.call(
          `${cpz.Service.DB_USER_ROBOTS}.get`,
          { id }
        );
        if (status === cpz.Status.started)
          userRobotsToPause.push({ id, status });
      } else {
        const robots: cpz.UserRobotDB[] = await this.broker.call(
          `${cpz.Service.DB_ROBOTS}.find`,
          {
            query: { status: cpz.Status.started }
          }
        );
        userRobotsToPause = robots.map(({ id, status }) => ({ id, status }));
      }

      if (userRobotsToPause.length > 0)
        await Promise.all(
          userRobotsToPause.map(async ({ id, status }) => {
            await this.queueJob(
              {
                id: uuid(),
                userRobotId: id,
                type: cpz.UserRobotJobType.pause
              },
              status
            );
          })
        );

      return { success: true, result: userRobotsToPause.length };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e };
    }
  }

  async resume(
    ctx: Context<{
      id: string;
    }>
  ) {
    try {
      const { id } = ctx.params;
      let userRobotIds: string[] = [];
      if (id) {
        const { status } = await this.broker.call(
          `${cpz.Service.DB_USER_ROBOTS}.get`,
          { id }
        );
        if (status === cpz.Status.paused) userRobotIds.push(id);
      } else {
        const robots: cpz.RobotState[] = await this.broker.call(
          `${cpz.Service.DB_USER_ROBOTS}.find`,
          {
            query: { status: cpz.Status.paused }
          }
        );
        userRobotIds = robots.map(({ id }) => id);
      }

      if (userRobotIds.length > 0)
        await Promise.all(
          userRobotIds.map(async userRobotId => {
            await this.broker.call(`${cpz.Service.DB_USER_ROBOTS}.update`, {
              id: userRobotId,
              status: cpz.Status.started
            });
          })
        );

      return { success: true, result: userRobotIds.length };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e };
    }
  }

  async handleSignalTrade(ctx: Context<cpz.SignalEvent>) {
    try {
      const signal = ctx.params;
      const { robotId } = signal;
      const userRobots: cpz.UserRobotDB[] = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.find`,
        {
          query: {
            robotId,
            $or: [
              {
                status: cpz.Status.started
              },
              {
                status: cpz.Status.paused
              }
            ]
          }
        }
      );

      this.logger.info(
        `New signal #${robotId} required by ${userRobots.length}`
      );
      await Promise.all(
        userRobots.map(
          async ({ id, status }) =>
            await this.queueJob(
              {
                id: uuid(),
                userRobotId: id,
                type: cpz.UserRobotJobType.signal,
                data: signal
              },
              status
            )
        )
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleOrder(ctx: Context<cpz.Order>) {
    const order = ctx.params;
    try {
      const { status }: cpz.UserRobotDB = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.get`,
        {
          id: order.userRobotId
        }
      );
      if (status)
        await this.queueJob(
          {
            id: uuid(),
            userRobotId: order.userRobotId,
            type: cpz.UserRobotJobType.order,
            data: order
          },
          status
        );
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = UserRobotRunnerService;

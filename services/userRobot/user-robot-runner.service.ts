import { Service, ServiceBroker, Context } from "moleculer";
import { Errors } from "moleculer-web";
import { v4 as uuid } from "uuid";
import { cpz } from "../../@types";
import { JobId } from "bull";
import QueueService from "moleculer-bull";
import dayjs from "../../lib/dayjs";
import Auth from "../../mixins/auth";
import cron from "node-cron";
import RedisLock from "../../mixins/redislock";
//import retry from "async-retry";

class UserRobotRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.USER_ROBOT_RUNNER,
      dependencies: [
        cpz.Service.DB_ROBOTS,
        cpz.Service.DB_USER_ROBOTS,
        cpz.Service.DB_USER_POSITIONS,
        cpz.Service.DB_USER_ORDERS,
        cpz.Service.DB_USER_ROBOT_JOBS
      ],
      mixins: [
        Auth,
        RedisLock(),
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
            maxStalledCount: 1
          }
        })
      ],
      actions: {
        start: {
          graphql: {
            mutation: "userRobotStart(id: ID!, message: String): ServiceStatus!"
          },
          params: {
            id: "string",
            message: { type: "string", optional: true }
          },
          roles: [cpz.UserRoles.user],
          handler: this.start
        },
        stop: {
          graphql: {
            mutation: "userRobotStop(id: ID!, message: String): ServiceStatus!"
          },
          params: {
            id: "string",
            message: { type: "string", optional: true }
          },
          roles: [cpz.UserRoles.user],
          handler: this.stop
        },
        pause: {
          graphql: {
            mutation:
              "userRobotPause(id: ID, userExAccId: ID, exchange: String, message: String): Response!"
          },
          params: {
            id: { type: "string", optional: true },
            userExAccId: { type: "string", optional: true },
            exchange: { type: "string", optional: true },
            message: { type: "string", optional: true }
          },
          roles: [cpz.UserRoles.admin],
          handler: this.pause
        },
        resume: {
          graphql: {
            mutation: "userRobotResume(id: ID, message: String): Response!"
          },
          params: {
            id: { type: "string", optional: true },
            message: { type: "string", optional: true }
          },
          roles: [cpz.UserRoles.admin],
          handler: this.resume
        }
      },
      events: {
        [cpz.Event.ORDER_STATUS]: this.handleOrder,
        [cpz.Event.SIGNAL_TRADE]: this.handleSignalTrade,
        [cpz.Event.USER_EX_ACC_ERROR]: this.handleUserExAccError,
        [cpz.Event.ORDER_ERROR]: this.handleOrderError
      },
      started: this.startedService,
      stopped: this.stoppedService
    });
  }

  cronJobs: cron.ScheduledTask = cron.schedule(
    "*/15 * * * * *",
    this.checkJobs.bind(this),
    {
      scheduled: false
    }
  );

  cronOrders: cron.ScheduledTask = cron.schedule(
    "* */1 * * * *",
    this.checkOrders.bind(this),
    {
      scheduled: false
    }
  );

  retryOptions = {
    retries: 5,
    minTimeout: 500,
    maxTimeout: 10000,
    onRetry: (err: any, i: number) => {
      this.logger.info("Retry", i);
      if (err) {
        this.logger.warn("Retry error : ", err);
      }
    }
  };

  async checkJobs() {
    try {
      const lock = await this.createLock(
        cpz.cronLock.USER_ROBOT_RUNNER_CHECK_JOBS,
        14000,
        2,
        5000
      );

      let timerId = setTimeout(async function tick() {
        await lock.extend(3500);
        timerId = setTimeout(tick, 3000);
      }, 13000);
      //  TODO: started or stopping
      const idledJobs: cpz.UserRobotJob[] = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOT_JOBS}.getIdled`,
        {
          date: dayjs.utc().add(-30, cpz.TimeUnit.second).toISOString()
        }
      );

      if (idledJobs && Array.isArray(idledJobs) && idledJobs.length > 0) {
        this.logger.info(`Requeue ${idledJobs.length} jobs`);
        for (const job of idledJobs) {
          try {
            const lastJob = await this.getQueue(cpz.Queue.runUserRobot).getJob(
              job.userRobotId
            );
            if (lastJob) {
              const lastJobState = await lastJob.getState();
              if (["stuck", "completed", "failed"].includes(lastJobState))
                try {
                  await lastJob.remove();
                } catch (e) {
                  this.logger.warn(e);
                  return;
                }
            }
            await this.createJob(cpz.Queue.runUserRobot, job, {
              jobId: job.userRobotId,
              removeOnComplete: true,
              removeOnFail: true
            });
          } catch (e) {
            this.logger.error(e);
          }
        }
      }

      clearInterval(timerId);
      await lock.unlock();
    } catch (e) {
      if (e instanceof this.LockError) return;
      else this.logger.error(e);
    }
  }

  async checkOrders() {
    try {
      const lock = await this.createLock(
        cpz.cronLock.USER_ROBOT_RUNNER_CHECK_ORDERS,
        14000,
        2,
        5000
      );

      let timerId = setTimeout(async function tick() {
        await lock.extend(3500);
        timerId = setTimeout(tick, 3000);
      }, 13000);
      //  TODO: started or stopping
      const idledOrders: cpz.Order[] = await this.broker.call(
        `${cpz.Service.DB_USER_ORDERS}.getIdled`,
        {
          date: dayjs.utc().add(-30, cpz.TimeUnit.second).toISOString()
        }
      );

      if (idledOrders && Array.isArray(idledOrders) && idledOrders.length > 0) {
        this.logger.info(`Requeue ${idledOrders.length} orders`);
        for (const order of idledOrders) {
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

      clearInterval(timerId);
      await lock.unlock();
    } catch (e) {
      if (e instanceof this.LockError) return;
      else this.logger.error(e);
    }
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
    this.cronJobs.start();
    this.cronOrders.start();
  }

  async stoppedService() {
    this.cronJobs.stop();
    this.cronOrders.stop();
  }

  async queueJob(job: cpz.UserRobotJob, status: string) {
    await this.broker.call(`${cpz.Service.DB_USER_ROBOT_JOBS}.upsert`, {
      entity: job
    });
    const { userRobotId } = job;
    if (status === cpz.Status.started || status === cpz.Status.stopping) {
      const lastJob = await this.getQueue(cpz.Queue.runUserRobot).getJob(
        userRobotId
      );
      if (lastJob) {
        const lastJobState = await lastJob.getState();
        if (["stuck", "completed", "failed"].includes(lastJobState)) {
          try {
            await lastJob.remove();
          } catch (e) {
            this.logger.warn(e);
            return;
          }
        } else return;
      }
      await this.createJob(cpz.Queue.runUserRobot, job, {
        jobId: userRobotId,
        removeOnComplete: true,
        removeOnFail: true
      });
    }
    this.logger.info(
      `Queue UserRobot ${job.userRobotId} job ${job.type} (${job.id})`
    );
  }

  async start(
    ctx: Context<
      {
        id: string;
        message?: string;
      },
      { user: cpz.User }
    >
  ) {
    try {
      this.authAction(ctx);
      const { id, message } = ctx.params;
      const {
        id: userId,
        roles: { allowedRoles }
      } = ctx.meta.user;
      const userRobot: cpz.UserRobotDB = await ctx.call(
        `${cpz.Service.DB_USER_ROBOTS}.get`,
        {
          id
        }
      );
      if (!userRobot)
        throw new Errors.NotFoundError("Failed to get user robot", {
          userRobotId: id
        });
      if (
        !allowedRoles.includes(cpz.UserRoles.admin) &&
        userId !== userRobot.userId
      )
        throw new Errors.ForbiddenError("FORBIDDEN", { userRobotId: id });

      const userExAcc: cpz.UserExchangeAccount = await ctx.call(
        `${cpz.Service.DB_USER_EXCHANGE_ACCS}.get`,
        {
          id: userRobot.userExAccId
        }
      );
      if (!userExAcc)
        throw new Errors.NotFoundError("Failed to get user exchange account", {
          userExAccId: userRobot.userExAccId
        });
      if (userExAcc.status !== cpz.UserExchangeAccStatus.enabled)
        throw new Error(`User Exchange Account status is ${userExAcc.status}`);
      if (userRobot.status === cpz.Status.paused) {
        await this.resumeRobot(id, message);

        return { success: true, id, status: cpz.Status.started };
      }
      if (userRobot.status === cpz.Status.started)
        return {
          success: true,
          id,
          status: userRobot.status
        };

      await ctx.call(`${cpz.Service.DB_USER_ROBOTS}.update`, {
        id,
        status: cpz.Status.started,
        message: message || null,
        startedAt: dayjs.utc().toISOString(),
        error: null,
        stoppedAt: null,
        latestSignal: null
      });

      await ctx.emit(cpz.Event.USER_ROBOT_STARTED, {
        userRobotId: id,
        message
      });
      return { success: true, id, status: cpz.Status.started };
    } catch (e) {
      this.logger.warn(e);
      return { success: false, error: e.message };
    }
  }

  async stop(
    ctx: Context<
      {
        id: string;
        message?: string;
      },
      { user: cpz.User }
    >
  ) {
    try {
      this.authAction(ctx);
      const { id, message } = ctx.params;
      const {
        id: userId,
        roles: { allowedRoles }
      } = ctx.meta.user;
      const userRobot: {
        id: string;
        status: string;
        userId: string;
      } = await ctx.call(`${cpz.Service.DB_USER_ROBOTS}.get`, {
        id,
        fields: ["id", "status", "userId"]
      });
      if (!userRobot)
        throw new Errors.NotFoundError("Failed to get user robot", {
          userRobotId: id
        });
      if (
        !allowedRoles.includes(cpz.UserRoles.admin) &&
        userId !== userRobot.userId
      )
        throw new Errors.ForbiddenError("FORBIDDEN", { userRobotId: id });

      if (
        userRobot.status === cpz.Status.stopping ||
        userRobot.status === cpz.Status.stopped
      )
        return {
          success: true,
          id,
          status: userRobot.status
        };
      const [jobExists] = await ctx.call(
        `${cpz.Service.DB_USER_ROBOT_JOBS}.find`,
        {
          fields: ["id"],
          query: {
            userRobotId: id,
            type: cpz.UserRobotJobType.stop
          }
        }
      );
      if (jobExists)
        return {
          success: true,
          id,
          status: cpz.Status.stopping
        };

      await this.queueJob(
        {
          id: uuid(),
          userRobotId: id,
          type: cpz.UserRobotJobType.stop,
          data: {
            userRobotId: id,
            message: message || null
          }
        },
        userRobot.status
      );
      return {
        success: true,
        id,
        status: cpz.Status.stopping
      };
    } catch (e) {
      this.logger.warn(e);
      return { success: false, error: e.message };
    }
  }

  async pause(
    ctx: Context<{
      id?: string;
      userExAccId?: string;
      exchange?: string;
      message?: string;
    }>
  ) {
    try {
      this.authAction(ctx);
      const { id, userExAccId, exchange, message } = ctx.params;
      let userRobotsToPause: { id: string; status: string }[] = [];
      if (id) {
        const { status } = await ctx.call(`${cpz.Service.DB_USER_ROBOTS}.get`, {
          id
        });
        if (status === cpz.Status.started)
          userRobotsToPause.push({ id, status });
      } else if (userExAccId) {
        const robots: cpz.UserRobotDB[] = await ctx.call(
          `${cpz.Service.DB_ROBOTS}.find`,
          {
            query: { status: cpz.Status.started, userExAccId }
          }
        );
        userRobotsToPause = robots.map(({ id, status }) => ({ id, status }));
      } else if (exchange) {
        const robots: cpz.UserRobotDB[] = await ctx.call(
          `${cpz.Service.DB_ROBOTS}.find`,
          {
            query: { status: cpz.Status.started, exchange }
          }
        );
        userRobotsToPause = robots.map(({ id, status }) => ({ id, status }));
      } else {
        const robots: cpz.UserRobotDB[] = await ctx.call(
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
                type: cpz.UserRobotJobType.pause,
                data: {
                  message
                }
              },
              status
            );
          })
        );

      return { success: true, result: userRobotsToPause.length };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async resume(
    ctx: Context<{
      id: string;
      message?: string;
    }>
  ) {
    try {
      this.authAction(ctx);
      const { id, message } = ctx.params;
      let userRobotIds: string[] = [];
      if (id) {
        const { status } = await ctx.call(`${cpz.Service.DB_USER_ROBOTS}.get`, {
          id
        });
        if (status === cpz.Status.paused) userRobotIds.push(id);
      } else {
        const robots: cpz.RobotState[] = await ctx.call(
          `${cpz.Service.DB_USER_ROBOTS}.find`,
          {
            query: { status: cpz.Status.paused }
          }
        );
        userRobotIds = robots.map(({ id }) => id);
      }

      if (userRobotIds.length > 0)
        await Promise.all(
          userRobotIds.map(async (userRobotId) => {
            await this.resumeRobot(userRobotId, message);
          })
        );

      return { success: true, result: userRobotIds.length };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async resumeRobot(id: string, message?: string) {
    try {
      const ordersWithJobs: cpz.Order[] = await this.broker.call(
        `${cpz.Service.DB_USER_ORDERS}.find`,
        {
          query: {
            userRobotId: id,
            nextJob: { $ne: null }
          }
        }
      );

      for (const order of ordersWithJobs) {
        const job = {
          id: uuid(),
          type: order.nextJob.type,
          priority: cpz.Priority.high,
          userExAccId: order.userExAccId,
          orderId: order.id,
          nextJobAt: dayjs.utc().toISOString()
        };

        await this.broker.call<Promise<void>, cpz.ConnectorJob>(
          `${cpz.Service.PRIVATE_CONNECTOR_RUNNER}.addJob`,
          job
        );
      }
      await this.broker.call(`${cpz.Service.DB_USER_ROBOTS}.update`, {
        id,
        message: message || null,
        status: cpz.Status.started
      });
      await this.broker.emit(cpz.Event.USER_ROBOT_RESUMED, {
        userRobotId: id,
        message
      });
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async handleSignalTrade(ctx: Context<cpz.SignalEvent>) {
    try {
      const signal = ctx.params;
      const { robotId } = signal;
      const userRobots: cpz.UserRobotDB[] = await ctx.call(
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
        userRobots.map(async ({ id, status }) => {
          try {
            await this.queueJob(
              {
                id: uuid(),
                userRobotId: id,
                type: cpz.UserRobotJobType.signal,
                data: signal
              },
              status
            );
          } catch (e) {
            this.logger.error(e);
          }
        })
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleOrder(ctx: Context<cpz.Order>) {
    const order = ctx.params;
    try {
      this.logger.info(
        `New ${cpz.Event.ORDER_STATUS} event for User Robot #${order.userRobotId}`
      );
      const { status }: cpz.UserRobotDB = await ctx.call(
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

  async handleUserExAccError(
    ctx: Context<{ id: string; errorMessage: string }>
  ) {
    try {
      const { id, errorMessage } = ctx.params;
      this.logger.error(
        `New ${cpz.Event.USER_EX_ACC_ERROR} event. User exchange account #${id} is invalid. Pausing user robots...`
      );
      let message: string = cpz.UserMessages.invalid_exchange_account;
      if (errorMessage) {
        message = `${message} (${errorMessage})`;
      }
      await this.actions.pause(
        {
          userExAccId: id,
          message
        },
        { parentCtx: ctx }
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleOrderError(ctx: Context<cpz.Order>) {
    try {
      const { id, userRobotId, error } = ctx.params;
      this.logger.error(
        `New ${cpz.Event.ORDER_ERROR} event. Order #${id} is invalid. Pausing user robot #${userRobotId}...`
      );
      let message: string = cpz.UserMessages.order_error;
      if (error) {
        message = `${message} (${error})`;
      }
      await this.actions.pause(
        {
          id: userRobotId,
          message
        },
        { parentCtx: ctx }
      );
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = UserRobotRunnerService;

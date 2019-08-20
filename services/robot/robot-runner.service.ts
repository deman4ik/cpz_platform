import { Service, ServiceBroker, Context } from "moleculer";
import { v4 as uuid } from "uuid";
import { cpz } from "../../types/cpz";
import { JobId } from "bull";
import QueueService from "moleculer-bull";
import { Op } from "sequelize";

class RobotRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.ROBOT_RUNNER,
      dependencies: [`${cpz.Service.DB_ROBOTS}`],
      mixins: [
        QueueService(process.env.REDIS_URL, {
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
          handler: this.start
        },
        stop: {
          params: {
            id: "string"
          },
          handler: this.stop
        },
        pause: {
          params: {
            id: { type: "string", optional: true }
          },
          handler: this.pause
        },
        resume: {
          params: {
            id: { type: "string", optional: true }
          },
          handler: this.resume
        }
      },
      events: {
        [cpz.Event.CANDLE_NEW]: this.handleNewCandle,
        [cpz.Event.TICK_NEW]: this.handleNewTick
      },
      started: this.startedService
    });
  }

  async jobCompleted(jobID: JobId, res: any) {
    this.logger.info(`Robot #${jobID} completed job`, res);
  }

  async jobError(error: Error) {
    this.logger.error(error);
  }

  async startedService() {
    await this.getQueue(cpz.Queue.runRobot).on(
      "global:completed",
      this.jobCompleted.bind(this)
    );
    await this.getQueue(cpz.Queue.runRobot).on(
      "error",
      this.jobError.bind(this)
    );
  }

  async queueJob(job: cpz.RobotJob, status: string) {
    await this.broker.call(`${cpz.Service.DB_ROBOT_JOBS}.upsert`, job);
    const { robotId } = job;
    if (status === cpz.Status.started)
      await this.createJob(cpz.Queue.runRobot, job, {
        jobId: robotId,
        removeOnComplete: true,
        removeOnFail: true
      });
  }

  async start(ctx: Context) {
    const { id } = ctx.params;
    const { status } = await this.broker.call(`${cpz.Service.DB_ROBOTS}.get`, {
      id
    });
    if (
      status === cpz.Status.started ||
      status === cpz.Status.paused ||
      status === cpz.Status.starting ||
      status === cpz.Status.stopping
    )
      return {
        id,
        status
      };

    return await this.broker.call(`${cpz.Service.ROBOT_WORKER}.start`, { id });
  }

  async stop(ctx: Context) {
    const { id } = ctx.params;
    const { status } = await this.broker.call(`${cpz.Service.DB_ROBOTS}.get`, {
      id
    });
    if (status === cpz.Status.stopping || status === cpz.Status.stopped)
      return {
        id,
        status
      };

    await this.queueJob(
      {
        id: uuid(),
        robotId: id,
        type: cpz.RobotJobType.stop
      },
      status
    );
    return {
      id,
      status
    };
  }

  async pause(ctx: Context) {
    const { id } = ctx.params;
    let robotsToPause: { id: string; status: string }[] = [];
    if (id) {
      const { status } = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.get`,
        { id }
      );
      if (status === cpz.Status.started) robotsToPause.push({ id, status });
    } else {
      const robots: cpz.RobotState[] = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.find`,
        {
          query: { status: cpz.Status.started }
        }
      );
      robotsToPause = robots.map(({ id, status }) => ({ id, status }));
    }

    if (robotsToPause.length > 0)
      await Promise.all(
        robotsToPause.map(async ({ id, status }) => {
          await this.queueJob(
            {
              id: uuid(),
              robotId: id,
              type: cpz.RobotJobType.pause
            },
            status
          );
        })
      );

    return robotsToPause.length;
  }

  async resume(ctx: Context) {
    const { id } = ctx.params;
    let robotIds: string[] = [];
    if (id) {
      const { status } = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.get`,
        { id }
      );
      if (status === cpz.Status.paused) robotIds.push(id);
    } else {
      const robots: cpz.RobotState[] = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.find`,
        {
          query: { status: cpz.Status.paused }
        }
      );
      robotIds = robots.map(({ id }) => id);
    }

    if (robotIds.length > 0)
      await Promise.all(
        robotIds.map(async robotId => {
          await this.broker.call(`${cpz.Service.DB_ROBOTS}.update`, {
            id: robotId,

            status: cpz.Status.started
          });
        })
      );

    return robotIds.length;
  }

  async handleNewCandle(ctx: Context) {
    try {
      const candle: cpz.Candle = <cpz.Candle>ctx.params;
      const { exchange, asset, currency, timeframe } = candle;
      const robots: cpz.RobotState[] = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.find`,
        {
          query: {
            exchange,
            asset,
            currency,
            timeframe,
            [Op.or]: [
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

      await Promise.all(
        robots.map(
          async ({ id, status }) =>
            await this.queueJob(
              {
                id: uuid(),
                robotId: id,
                type: cpz.RobotJobType.candle,
                data: candle
              },
              status
            )
        )
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleNewTick(ctx: Context) {
    try {
      const tick: cpz.ExwatcherTrade = <cpz.ExwatcherTrade>ctx.params;
      const { exchange, asset, currency } = tick;
      const robots: cpz.RobotState[] = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.find`,
        {
          query: {
            exchange,
            asset,
            currency,
            [Op.or]: [
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

      await Promise.all(
        robots.map(
          async ({ id, status }) =>
            await this.queueJob(
              {
                id: uuid(),
                robotId: id,
                type: cpz.RobotJobType.tick,
                data: tick
              },
              status
            )
        )
      );
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = RobotRunnerService;

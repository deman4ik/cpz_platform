import { Service, ServiceBroker, Context } from "moleculer";
import { v4 as uuid } from "uuid";
import { cpz } from "../../types/cpz";
import { JobId } from "bull";
import QueueService from "moleculer-bull";
import dayjs from "../../lib/dayjs";
import Timeframe from "../../utils/timeframe";
import { CANDLES_RECENT_AMOUNT } from "../../config";

class RobotRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.ROBOT_RUNNER,
      dependencies: [`${cpz.Service.DB_ROBOTS}`],
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
      actions: {
        startup: {
          params: {
            id: "string"
          },
          graphql: {
            mutation: "robotStartup(id: ID!): ServiceStatus!"
          },
          handler: this.startUp
        },
        start: {
          params: {
            id: "string",
            dateFrom: {
              type: "string",
              optional: true
            }
          },
          graphql: {
            mutation: "robotStart(id: ID!, dateFrom: String): ServiceStatus!"
          },
          handler: this.start
        },
        stop: {
          params: {
            id: "string"
          },
          graphql: {
            mutation: "robotStop(id: ID!): ServiceStatus!"
          },
          handler: this.stop
        },
        pause: {
          graphql: {
            mutation: "robotPause(id: ID): Response!"
          },
          params: {
            id: { type: "string", optional: true }
          },
          handler: this.pause
        },
        resume: {
          graphql: {
            mutation: "robotResume(id: ID): Response!"
          },
          params: {
            id: { type: "string", optional: true }
          },
          handler: this.resume
        }
      },
      events: {
        [cpz.Event.CANDLE_NEW]: this.handleNewCandle,
        [cpz.Event.TICK_NEW]: this.handleNewTick,
        [cpz.Event.BACKTESTER_FINISHED_HISTORY]: this.handleBacktesterFinished,
        [cpz.Event.BACKTESTER_FAILED]: this.handleBacktesterFailed
      },
      started: this.startedService
    });
  }

  async jobCompleted(jobID: JobId, res: any) {
    this.logger.info(`Robot #${jobID} completed job`);
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
    await this.getQueue(cpz.Queue.runRobot).on(
      "fail",
      this.jobError.bind(this)
    );
  }

  async queueJob(job: cpz.RobotJob, status: string) {
    await this.broker.call(`${cpz.Service.DB_ROBOT_JOBS}.upsert`, {
      entity: job
    });
    const { robotId } = job;
    if (status === cpz.Status.started)
      await this.createJob(cpz.Queue.runRobot, job, {
        jobId: robotId,
        removeOnComplete: true,
        removeOnFail: true
      });
  }

  async start(ctx: Context) {
    const { id, dateFrom } = ctx.params;
    try {
      const {
        status,
        exchange,
        asset,
        currency,
        timeframe,
        settings: { requiredHistoryMaxBars }
      } = await this.broker.call(`${cpz.Service.DB_ROBOTS}.get`, {
        id
      });
      if (status === cpz.Status.paused) {
        const result = await this.resume(ctx);
        if (result && result.success)
          return { success: true, id, status: cpz.Status.started };
        else throw result.error;
      }
      if (
        status === cpz.Status.started ||
        status === cpz.Status.starting ||
        status === cpz.Status.stopping
      )
        return {
          success: true,
          id,
          status
        };

      await this.broker.call(`${cpz.Service.DB_ROBOTS}.update`, {
        id,
        status: cpz.Status.starting,
        startedAt: null,
        stoppedAt: null,
        statistics: {},
        equity: {},
        lastCandle: null,
        hasAlerts: false,
        indicators: {},
        state: {
          variables: {},
          positions: [],
          posLastNumb: {},
          indicators: {},
          initialized: false
        }
      });
      await this.broker.call(`${cpz.Service.DB_ROBOTS}.clear`, {
        robotId: id
      });

      const [firstCandle] = await this.broker.call(
        `${cpz.Service.DB_CANDLES}${timeframe}.find`,
        {
          limit: 1,
          offset: CANDLES_RECENT_AMOUNT,
          sort: "time",
          query: {
            exchange,
            asset,
            currency,
            type: { $ne: cpz.CandleType.previous }
          }
        }
      );
      const { unit } = Timeframe.get(timeframe);
      let historyDateFrom = firstCandle.timestamp;
      if (dateFrom)
        historyDateFrom =
          dayjs.utc(historyDateFrom).valueOf() > dayjs.utc(dateFrom).valueOf()
            ? historyDateFrom
            : dateFrom;
      const dateTo = dayjs
        .utc()
        .startOf(unit)
        .toISOString();
      const backtesterStatus = await this.broker.call(
        `${cpz.Service.BACKTESTER_RUNNER}.start`,
        {
          id,
          robotId: id,
          dateFrom: historyDateFrom,
          dateTo,
          settings: {
            local: false,
            populateHistory: true
          }
        }
      );
      if (backtesterStatus.success === false) return backtesterStatus;
      return { success: true, id, status: cpz.Status.starting };
    } catch (e) {
      this.logger.error(e);
      return { success: false, id: ctx.params.id, error: e };
    }
  }

  async startUp(ctx: Context) {
    const { id } = ctx.params;
    try {
      const { status } = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.get`,
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
      if (
        status === cpz.Status.started ||
        status === cpz.Status.starting ||
        status === cpz.Status.stopping
      )
        return {
          success: true,
          id,
          status
        };

      await this.broker.call(`${cpz.Service.ROBOT_WORKER}.startUp`, {
        id
      });
      return { success: true, id, status: cpz.Status.started };
    } catch (e) {
      this.logger.error(e);
      return { success: false, id: ctx.params.id, error: e };
    }
  }

  async stop(ctx: Context) {
    const { id } = ctx.params;
    try {
      const { status } = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.get`,
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
          robotId: id,
          type: cpz.RobotJobType.stop
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

  async pause(ctx: Context) {
    try {
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

      return { success: true, result: robotsToPause.length };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e };
    }
  }

  async resume(ctx: Context) {
    try {
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

      return { success: true, result: robotIds.length };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e };
    }
  }

  async handleNewCandle(ctx: Context) {
    try {
      const candle: cpz.Candle = <cpz.Candle>ctx.params;
      const { exchange, asset, currency, timeframe, timestamp } = candle;
      const robots: cpz.RobotState[] = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.findActive`,
        {
          exchange,
          asset,
          currency,
          timeframe
        }
      );
      this.logger.info(
        `New candle ${exchange}.${asset}.${currency}.${timeframe} ${timestamp} required by ${robots.length}`
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
      const { exchange, asset, currency, timestamp, price } = tick;
      const robots: cpz.RobotState[] = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.findActive`,
        {
          exchange,
          asset,
          currency
        }
      );
      this.logger.info(
        `New tick ${exchange}.${asset}.${currency} ${timestamp} ${price} required by ${robots.length}`
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

  async handleBacktesterFinished(ctx: Context) {
    try {
      const { id } = ctx.params;
      await this.broker.call(`${cpz.Service.DB_ROBOTS}.update`, {
        id,
        status: cpz.Status.started
      });
      await this.broker.emit(`${cpz.Event.ROBOT_STARTED}`, {
        robotId: id,
        eventType: cpz.Event.ROBOT_STARTED
      });
      this.logger.info(`Robot ${id} started!`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleBacktesterFailed(ctx: Context) {
    try {
      const { id, error } = ctx.params;
      await this.broker.call(`${cpz.Service.DB_ROBOTS}.update`, {
        id,
        status: cpz.Status.failed,
        error
      });
      await this.broker.emit(`${cpz.Event.ROBOT_FAILED}`, {
        robotId: id,
        eventType: cpz.Event.ROBOT_FAILED,
        error
      });
      this.logger.error(`Failed to start Robot ${id}`, error);
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = RobotRunnerService;

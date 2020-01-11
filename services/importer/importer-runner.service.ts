import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { JobId } from "bull";
import { v4 as uuid } from "uuid";
import { cpz } from "../../@types";
import Timeframe from "../../utils/timeframe";
import { CANDLES_RECENT_AMOUNT } from "../../config";
import dayjs from "../../lib/dayjs";
import Auth from "../../mixins/auth";
import { ISO_DATE_REGEX } from "../../utils";

class ImporterRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.IMPORTER_RUNNER,
      mixins: [
        Auth,
        QueueService({
          redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS && {}
          },
          settings: {
            lockDuration: 120000,
            lockRenewTime: 10000,
            stalledInterval: 120000,
            maxStalledCount: 1
          }
        })
      ],
      dependencies: [cpz.Service.DB_IMPORTERS, cpz.Service.DB_MARKETS],
      actions: {
        startRecent: {
          params: {
            exchange: {
              type: "string"
            },
            asset: {
              type: "string"
            },
            currency: {
              type: "string"
            },
            timeframes: {
              type: "array",
              enum: Timeframe.validArray,
              empty: false,
              optional: true
            },
            amount: {
              type: "number",
              integer: true,
              positive: true,
              optional: true
            }
          },
          graphql: {
            mutation:
              "importCandlesStartRecent(exchange: String!, asset: String!, currency: String!, timeframes: [Int!], amount: Int): ServiceStatus!"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.startRecent
        },
        startHistory: {
          params: {
            exchange: {
              type: "string"
            },
            asset: {
              type: "string"
            },
            currency: {
              type: "string"
            },
            timeframes: {
              type: "array",
              enum: Timeframe.validArray,
              empty: false,
              optional: true
            },
            dateFrom: {
              type: "string",
              pattern: ISO_DATE_REGEX,
              optional: true
            },
            dateTo: {
              type: "string",
              pattern: ISO_DATE_REGEX,
              optional: true
            }
          },
          graphql: {
            mutation:
              "importCandlesStartHistory(exchange: String!, asset: String!, currency: String!, timeframes: [Int!], dateFrom: String, dateTo: String): ServiceStatus!"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.startHistory
        },
        clean: {
          params: {
            period: {
              description: "Grace period in milliseconds",
              type: "number",
              optional: true,
              positive: true,
              integer: true,
              min: 1000
            },
            status: {
              description: "Job status",
              type: "string",
              enum: ["completed", "wait", "active", "delayed", "failed"],
              optional: true
            }
          },
          graphql: {
            mutation:
              "importCandlesCleanJobs(period: Int, status: String): JSON"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.clean
        },
        getStatus: {
          params: {
            id: "string"
          },
          graphql: {
            query: "importCandlesJobStatus(id: ID!): JSON!"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.getStatus
        }
      },
      started: this.startedService
    });
  }

  async jobProgress(jobID: JobId, progress: number) {
    this.logger.info(`Job #${jobID} progress is ${progress}%`);
  }
  async jobCompleted(jobID: JobId, res: any) {
    this.logger.info(`Job #${jobID} completed!`, res);
  }
  async jobError(error: Error) {
    this.logger.error(error);
  }

  async startedService() {
    await this.getQueue(cpz.Queue.importCandles).on(
      "global:progress",
      this.jobProgress.bind(this)
    );
    await this.getQueue(cpz.Queue.importCandles).on(
      "global:completed",
      this.jobCompleted.bind(this)
    );
    await this.getQueue(cpz.Queue.importCandles).on(
      "error",
      this.jobError.bind(this)
    );
    await this.getQueue(cpz.Queue.importCandles).on(
      "fail",
      this.jobError.bind(this)
    );
  }

  async startRecent(
    ctx: Context<{
      exchange: string;
      asset: string;
      currency: string;
      timeframes: cpz.Timeframe[];
      amount?: number;
    }>
  ) {
    const id = uuid();
    try {
      const state: cpz.Importer = {
        id,
        exchange: ctx.params.exchange,
        asset: ctx.params.asset,
        currency: ctx.params.currency,
        type: "recent",
        params: {
          timeframes: ctx.params.timeframes || Timeframe.validArray,
          amount: ctx.params.amount || CANDLES_RECENT_AMOUNT
        },
        status: cpz.Status.queued
      };
      await ctx.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
        entity: state
      });
      const lastJob = await this.getQueue(cpz.Queue.importCandles).getJob(id);
      if (lastJob) {
        const lastJobStuck = await lastJob.isStuck();
        if (lastJobStuck) await lastJob.remove();
      }
      await this.createJob(cpz.Queue.importCandles, state, {
        jobId: id,
        removeOnComplete: true,
        removeOnFail: true
      });

      return { success: true, id, status: state.status };
    } catch (e) {
      this.logger.error(e);
      return { success: false, id, error: e };
    }
  }

  async startHistory(
    ctx: Context<{
      exchange: string;
      asset: string;
      currency: string;
      timeframes: cpz.Timeframe[];
      dateFrom: string;
      dateTo: string;
    }>
  ) {
    const id = uuid();
    try {
      let dateFrom;
      if (!ctx.params.dateFrom) {
        const [{ loadFrom }]: cpz.Market[] = await ctx.call(
          `${cpz.Service.DB_MARKETS}.find`,
          {
            fields: ["loadFrom"],
            query: {
              exchange: ctx.params.exchange,
              asset: ctx.params.asset,
              currency: ctx.params.currency
            }
          }
        );
        if (!loadFrom) throw new Error("Failed to find market");
        dateFrom = loadFrom;
      } else {
        dateFrom = dayjs
          .utc(ctx.params.dateFrom)
          .startOf(cpz.TimeUnit.day)
          .toISOString();
      }
      const state: cpz.Importer = {
        id,
        exchange: ctx.params.exchange,
        asset: ctx.params.asset,
        currency: ctx.params.currency,
        type: "history",
        params: {
          timeframes: ctx.params.timeframes || Timeframe.validArray,
          dateFrom,
          dateTo: ctx.params.dateTo
        },
        status: cpz.Status.queued
      };
      await ctx.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
        entity: state
      });
      const lastJob = await this.getQueue(cpz.Queue.importCandles).getJob(id);
      if (lastJob) {
        const lastJobStuck = await lastJob.isStuck();
        if (lastJobStuck) await lastJob.remove();
      }
      await this.createJob(cpz.Queue.importCandles, state, {
        jobId: id,
        removeOnComplete: true,
        removeOnFail: true
      });

      return { success: true, id, status: state.status };
    } catch (e) {
      this.logger.error(e);
      return { success: false, id, error: e };
    }
  }

  async clean(
    ctx: Context<{
      period?: number;
      status?: string;
    }>
  ) {
    return await this.getQueue(cpz.Queue.importCandles).clean(
      ctx.params.period || 5000,
      ctx.params.status || "completed"
    );
  }

  async getStatus(
    ctx: Context<{
      id: string;
    }>
  ) {
    const job = await this.getQueue(cpz.Queue.importCandles).getJob(
      ctx.params.id
    );
    const status = await job.getState();
    return { id: ctx.params.id, status };
  }
}

export = ImporterRunnerService;

import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { JobId } from "bull";
import { v4 as uuid } from "uuid";
import { cpz } from "../../types/cpz";
import Timeframe from "../../utils/timeframe";
import { CANDLES_RECENT_AMOUNT } from "../../config";

class ImporterRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.IMPORTER_RUNNER,
      mixins: [
        QueueService(process.env.REDIS_URL, {
          redis: {
            tls: true
          },
          settings: {
            lockDuration: 120000,
            lockRenewTime: 10000,
            stalledInterval: 120000,
            maxStalledCount: 1
          }
        })
      ],
      dependencies: [cpz.Service.DB_IMPORTERS],
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
              "importerStartRecent(exchange: String!, asset: String!, currency: String!, timeframes: [Int!], amount: Int): ServiceStatus!"
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
              type: "string"
            },
            dateTo: {
              type: "string"
            }
          },
          graphql: {
            mutation:
              "importerStartHistory(exchange: String!, asset: String!, currency: String!, timeframes: [Int!], dateFrom: Datetime!, dateTo: Datetime!): ServiceStatus!"
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
            mutation: "importerCleanJobs(period: Int, status: String): JSON"
          },
          handler: this.clean
        },
        getStatus: {
          params: {
            id: "string"
          },
          graphql: {
            query: "importerJobStatus(id: ID!): JSON!"
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
    this.logger.info(`Job #${jobID} completed!`);
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
  }

  async startRecent(ctx: Context) {
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
      await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
        entity: state
      });
      await this.createJob(cpz.Queue.importCandles, state, { jobId: id });

      return { success: true, id, status: state.status };
    } catch (e) {
      this.logger.error(e);
      return { success: false, id, error: e };
    }
  }

  async startHistory(ctx: Context) {
    const id = uuid();
    try {
      const state: cpz.Importer = {
        id,
        exchange: ctx.params.exchange,
        asset: ctx.params.asset,
        currency: ctx.params.currency,
        type: "history",
        params: {
          timeframes: ctx.params.timeframes || Timeframe.validArray,
          dateFrom: ctx.params.dateFrom,
          dateTo: ctx.params.dateTo
        },
        status: cpz.Status.queued
      };
      await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
        entity: state
      });
      await this.createJob(cpz.Queue.importCandles, state, { jobId: id });

      return { success: true, id, status: state.status };
    } catch (e) {
      this.logger.error(e);
      return { success: false, id, error: e };
    }
  }

  async clean(ctx: Context) {
    return await this.getQueue("importCandles").clean(
      ctx.params.period || 5000,
      ctx.params.status || "completed"
    );
  }

  async getStatus(ctx: Context) {
    const job = await this.getQueue(cpz.Queue.importCandles).getJob(
      ctx.params.id
    );
    const status = await job.getState();
    return { id: ctx.params.id, status };
  }
}

export = ImporterRunnerService;

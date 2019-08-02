import { ServiceSchema } from "moleculer";
import QueueService from "moleculer-bull";
import { JobId } from "bull";
import { v4 as uuid } from "uuid";
import { cpz } from "../../types/cpz";
import Timeframe from "../../utils/timeframe";
import { CANDLES_RECENT_AMOUNT } from "../../config";

const ImporterService: ServiceSchema = {
  name: cpz.Service.IMPORTER_RUNNER,
  mixins: [
    QueueService(process.env.REDIS_URL, {
      settings: {
        lockDuration: 120000,
        lockRenewTime: 10000,
        stalledInterval: 120000,
        maxStalledCount: 1
      }
    })
  ],
  /**
   * Service settings
   */
  settings: {},

  /**
   * Service dependencies
   */
  dependencies: [cpz.Service.DB_IMPORTERS],

  /**
   * Actions
   */
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
      async handler(ctx) {
        const id = uuid();
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

        return { id, status: state.status };
      }
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
      async handler(ctx) {
        const id = uuid();
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

        return { jobId: id, status: state.status };
      }
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
      async handler(ctx) {
        return await this.getQueue("importCandles").clean(
          ctx.params.period || 5000,
          ctx.params.status || "completed"
        );
      }
    },
    getStatus: {
      params: {
        id: "string"
      },
      async handler(ctx) {
        const job = await this.getQueue(cpz.Queue.importCandles).getJob(
          ctx.params.id
        );
        const status = await job.getState();
        return { id: ctx.params.id, status };
      }
    }
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {
    async jobProgress(jobID: JobId, progress: number) {
      this.logger.info(`Job #${jobID} progress is ${progress}%`);
    },
    async jobCompleted(jobID: JobId, res: any) {
      this.logger.info(`Job #${jobID} completed!. Result:`, res);
    },
    async jobError(error: Error) {
      this.logger.error(error);
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created() {},

  /**
   * Service started lifecycle event handler
   */
  async started() {
    await this.getQueue(cpz.Queue.importCandles).on(
      "global:progress",
      this.jobProgress
    );
    await this.getQueue(cpz.Queue.importCandles).on(
      "global:completed",
      this.jobCompleted
    );
    await this.getQueue(cpz.Queue.importCandles).on("error", this.jobError);
  }

  /**
   * Service stopped lifecycle event handler
   */
  // stopped() {

  // },
};

export = ImporterService;

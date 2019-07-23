import { ServiceSchema } from "moleculer";
import QueueService from "moleculer-bull";
import { JobId, Job } from "bull";
import { v4 as uuid } from "uuid";
import { cpz } from "../../types/cpz";
import Timeframe from "../../utils/timeframe";
import { CANDLES_CURRENT_AMOUNT } from "../../config";

const ImporterService: ServiceSchema = {
  name: "importer",
  mixins: [QueueService()],
  /**
   * Service settings
   */
  settings: {},

  /**
   * Service dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    current: {
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
        const jobId = uuid();
        await this.createJob(
          cpz.Queue.importCandles,
          cpz.ImportSubQueue.current,
          {
            ...ctx.params,
            timeframes: ctx.params.timeframes || Timeframe.validArray,
            amount: ctx.params.amount || CANDLES_CURRENT_AMOUNT
          },
          { jobId }
        );
        const job = await this.getQueue(cpz.Queue.importCandles).getJob(jobId);
        const status = await job.getState();

        return { jobId, status };
      }
    },
    history: {
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
        const jobId = uuid();
        await this.createJob(
          cpz.Queue.importCandles,
          cpz.ImportSubQueue.history,
          {
            ...ctx.params,
            timeframes: ctx.params.timeframes || Timeframe.validArray
          },
          { jobId }
        );
        const job = await this.getQueue(cpz.Queue.importCandles).getJob(jobId);
        const status = await job.getState();

        return { jobId, status };
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
        await this.getQueue("importCandles").clean(
          ctx.params.period || 5000,
          ctx.params.status || "completed"
        );
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

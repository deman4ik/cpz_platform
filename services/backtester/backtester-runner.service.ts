import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { JobId } from "bull";
import { v4 as uuid } from "uuid";
import { cpz } from "../../@types";
import Auth from "../../mixins/auth";
import { ISO_DATE_REGEX } from "../../utils";

class BacktesterRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.BACKTESTER_RUNNER,
      settings: {
        graphql: {
          type: `
          input BacktestSettings {
            local: Boolean,
            populateHistory: Boolean
          }
          `
        }
      },
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
      actions: {
        start: {
          params: {
            id: {
              type: "string",
              optional: true
            },
            robotId: {
              type: "string"
            },
            dateFrom: {
              type: "string",
              pattern: ISO_DATE_REGEX
            },
            dateTo: {
              type: "string",
              pattern: ISO_DATE_REGEX
            },
            settings: {
              type: "object",
              props: {
                local: {
                  type: "boolean",
                  optional: true
                },
                populateHistory: {
                  type: "boolean",
                  optional: true
                }
              },
              optional: true
            },
            robotSettings: {
              type: "object",
              optional: true
            }
          },
          graphql: {
            mutation:
              "backtestStart(id: String, robotId: String!, dateFrom: String!, dateTo: String!, settings: BacktestSettings, robotSettings: JSON): ServiceStatus!"
          },
          roles: [cpz.UserRoles.admin],
          handler: this.start
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
              "backtestCleanJobs(period: Int, status: String): Response!"
          },
          roles: [cpz.UserRoles.admin],
          handler: this.clean
        },
        getStatus: {
          params: {
            id: "string"
          },
          graphql: {
            query: "backtestJobStatus(id: ID!): Response!"
          },
          roles: [cpz.UserRoles.admin],
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
    await this.getQueue(cpz.Queue.backtest).on(
      "global:progress",
      this.jobProgress.bind(this)
    );
    await this.getQueue(cpz.Queue.backtest).on(
      "global:completed",
      this.jobCompleted.bind(this)
    );
    await this.getQueue(cpz.Queue.backtest).on(
      "error",
      this.jobError.bind(this)
    );
    await this.getQueue(cpz.Queue.backtest).on(
      "fail",
      this.jobError.bind(this)
    );
  }

  async start(
    ctx: Context<{
      id: string;
      robotId: string;
      dateFrom: string;
      dateTo: string;
      settings: cpz.BacktesterSettings;
      robotSettings: cpz.RobotSettings;
    }>
  ) {
    const id = ctx.params.id || uuid();
    try {
      this.authAction(ctx);
      const { robotId, dateFrom, dateTo, settings, robotSettings } = ctx.params;

      if (settings && settings.populateHistory && id !== robotId)
        return {
          success: false,
          id,
          status: cpz.Status.failed,
          error: new Error("Wrong Backtester ID for history populating")
        };
      const lastJob = await this.getQueue(cpz.Queue.backtest).getJob(id);

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
      await this.createJob(
        cpz.Queue.backtest,
        {
          id,
          robotId,
          dateFrom,
          dateTo,
          settings,
          robotSettings
        },
        { jobId: id, removeOnComplete: true, removeOnFail: true }
      );

      return { success: true, id, status: cpz.Status.queued };
    } catch (e) {
      this.logger.error(e);
      return { success: false, id, error: e.message };
    }
  }

  async clean(
    ctx: Context<{
      period?: number;
      status?: string;
    }>
  ) {
    try {
      this.authAction(ctx);
      const result = await this.getQueue(cpz.Queue.backtest).clean(
        ctx.params.period || 5000,
        ctx.params.status || "completed"
      );
      return { success: true, result };
    } catch (e) {
      this.logger.warn(e);
      return { success: false, error: e.message };
    }
  }

  async getStatus(ctx: Context<{ id: string }>) {
    try {
      this.authAction(ctx);
      const job = await this.getQueue(cpz.Queue.backtest).getJob(ctx.params.id);
      const status = await job.getState();
      return { success: true, result: { id: ctx.params.id, status } };
    } catch (e) {
      this.logger.warn(e);
      return { success: false, error: e.message };
    }
  }
}

export = BacktesterRunnerService;

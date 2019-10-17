import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { JobId } from "bull";
import { v4 as uuid } from "uuid";
import { cpz } from "../../@types";
import Auth from "../../mixins/auth";

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
            tls: process.env.REDIS_TLS,
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD
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
              type: "string"
            },
            dateTo: {
              type: "string"
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
          hooks: {
            before: "authAction"
          },
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
            mutation: "backtesterCleanJobs(period: Int, status: String): JSON"
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
            query: "backtesterJobStatus(id: ID!): JSON!"
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
      const { robotId, dateFrom, dateTo, settings, robotSettings } = ctx.params;

      if (settings && settings.populateHistory && id !== robotId)
        return {
          success: false,
          id,
          status: cpz.Status.failed,
          error: new Error("Wrong Backtester ID for history populating")
        };
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
      return { success: false, id, error: e };
    }
  }

  async clean(
    ctx: Context<{
      period?: number;
      status?: string;
    }>
  ) {
    return await this.getQueue(cpz.Queue.backtest).clean(
      ctx.params.period || 5000,
      ctx.params.status || "completed"
    );
  }

  async getStatus(ctx: Context<{ id: string }>) {
    const job = await this.getQueue(cpz.Queue.backtest).getJob(ctx.params.id);
    const status = await job.getState();
    return { id: ctx.params.id, status };
  }
}

export = BacktesterRunnerService;

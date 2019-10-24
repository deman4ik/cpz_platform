import { Service, ServiceBroker, Context } from "moleculer";
import { v4 as uuid } from "uuid";
import { cpz } from "../../@types";
import { JobId } from "bull";
import QueueService from "moleculer-bull";

class PricateConnectorRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.PRIVATE_CONNECTOR_RUNNER,
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
        addJob: {
          params: {
            userExAccId: "string",
            type: "string",
            orderId: "string"
          },
          handler: this.addJob
        }
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
    await this.getQueue(cpz.Queue.connector).on(
      "global:completed",
      this.jobCompleted.bind(this)
    );
    await this.getQueue(cpz.Queue.connector).on(
      "error",
      this.jobError.bind(this)
    );
    await this.getQueue(cpz.Queue.connector).on(
      "fail",
      this.jobError.bind(this)
    );
  }

  async queueJob(job: cpz.ConnectorJob, status: string) {
    await this.broker.call(`${cpz.Service.DB_CONNECTOR_JOBS}.upsert`, {
      entity: job
    });
    const { userExAccId } = job;
    if (status === cpz.UserExchangeAccStatus.enabled)
      await this.createJob(cpz.Queue.connector, job, {
        jobId: userExAccId,
        removeOnComplete: true,
        removeOnFail: true
      });
  }

  async addJob(
    ctx: Context<{
      userExAccId: string;
      type: cpz.ConnectorJobType;
      orderId: string;
    }>
  ) {
    try {
      const { userExAccId, type, orderId } = ctx.params;
      const { status } = await this.broker.call(
        `${cpz.Service.DB_USER_EXCHANGE_ACCS}.get`,
        {
          id: userExAccId
        }
      );
      await this.queueJob({ id: uuid(), userExAccId, type, orderId }, status);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}

export = PricateConnectorRunnerService;

import { Service, ServiceBroker, Context } from "moleculer";
import { v4 as uuid } from "uuid";
import { cpz } from "../../@types";
import { JobId } from "bull";
import QueueService from "moleculer-bull";
import cron from "node-cron";

class PricateConnectorRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.PRIVATE_CONNECTOR_RUNNER,
      dependencies: [
        cpz.Service.DB_USER_ORDERS,
        cpz.Service.DB_USER_EXCHANGE_ACCS,
        cpz.Service.DB_CONNECTOR_JOBS
      ],
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
            data: { type: "object", optional: true }
          },
          handler: this.addJob
        }
      },
      started: this.startedService,
      stopped: this.stoppedService
    });
  }

  cronOrders: cron.ScheduledTask = cron.schedule(
    "*/15 * * * * *",
    this.checkOrders.bind(this),
    {
      scheduled: false
    }
  );

  async checkOrders() {
    try {
      const userExAccIds = await this.broker.call(
        `${cpz.Service.DB_USER_ORDERS}.getUserExAccsWithJobs`
      );
      if (userExAccIds && Array.isArray(userExAccIds) && userExAccIds.length) {
        this.logger.info(`${userExAccIds.length} userExAccs has order jobs`);
        for (const userExAccId of userExAccIds) {
          const { status } = await this.broker.call(
            `${cpz.Service.DB_USER_EXCHANGE_ACCS}.get`,
            {
              id: userExAccId
            }
          );
          await this.queueJob(
            { id: uuid(), userExAccId, type: cpz.ConnectorJobType.order },
            status
          );
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
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
    this.cronOrders.start();
  }

  async stoppedService() {
    this.cronOrders.stop();
  }

  async queueJob(job: cpz.ConnectorJob, status: string) {
    await this.broker.call(`${cpz.Service.DB_CONNECTOR_JOBS}.upsert`, {
      entity: job
    });
    const { userExAccId } = job;
    if (status === cpz.UserExchangeAccStatus.enabled) {
      const lastJob = await this.getQueue(cpz.Queue.connector).getJob(
        userExAccId
      );
      if (lastJob) {
        const lastJobStuck = await lastJob.isStuck();
        if (lastJobStuck) await lastJob.remove();
      }
      await this.createJob(cpz.Queue.connector, job, {
        jobId: userExAccId,
        removeOnComplete: true,
        removeOnFail: true
      });
    }
    this.logger.info("Queued", job);
  }

  async addJob(
    ctx: Context<{
      userExAccId: string;
      type: cpz.ConnectorJobType;
      data?: any;
    }>
  ) {
    try {
      const { userExAccId, type, data } = ctx.params;
      const { status } = await this.broker.call(
        `${cpz.Service.DB_USER_EXCHANGE_ACCS}.get`,
        {
          id: userExAccId
        }
      );
      await this.queueJob({ id: uuid(), userExAccId, type, data }, status);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}

export = PricateConnectorRunnerService;

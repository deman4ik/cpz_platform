import { Service, ServiceBroker, Context, Errors } from "moleculer";
import { cpz } from "../../@types";
import { JobId } from "bull";
import QueueService from "moleculer-bull";
import Auth from "../../mixins/auth";

class StatsCalcRunnerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.STATS_CALC_RUNNER,
      mixins: [
        Auth,
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
      actions: {},
      events: {
        [cpz.Event.STATS_CALC_ROBOT]: this.handleStatsCalcRobotEvent,
        [cpz.Event.STATS_CALC_USER_ROBOT]: this.handleStatsCalcUserRobotEvent
      },
      started: this.startedService,
      stopped: this.stoppedService
    });
  }

  async jobCompleted(jobID: JobId, res: any) {
    this.logger.info(`Stats Calc #${jobID} completed job`);
  }

  async jobError(error: Error) {
    this.logger.error(error);
  }

  async startedService() {
    await this.getQueue(cpz.Queue.statsCalc).on(
      "global:completed",
      this.jobCompleted.bind(this)
    );
    await this.getQueue(cpz.Queue.statsCalc).on(
      "error",
      this.jobError.bind(this)
    );
    await this.getQueue(cpz.Queue.statsCalc).on(
      "fail",
      this.jobError.bind(this)
    );
  }

  async queueJob(job: cpz.StatsCalcJob) {
    await this.createJob(cpz.Queue.statsCalc, job, {
      jobId: job.id,
      removeOnComplete: true,
      removeOnFail: true
    });
  }

  async handleStatsCalcRobotEvent(ctx: Context<cpz.StatsCalcRobotEvent>) {
    try {
      const { robotId, exchange, asset } = ctx.params;
      await this.queueJob({
        id: robotId,
        type: cpz.StatsCalcJobType.robot,
        robotId
      });
      await this.queueJob({
        id: robotId,
        type: cpz.StatsCalcJobType.userSignals,
        robotId
      });
      await this.queueJob({
        id: `${cpz.StatsCalcJobType.userSignalsAggr}-${robotId}`,
        type: cpz.StatsCalcJobType.userSignalsAggr,
        robotId
      });

      const usersByExchange = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getSubscribedUserIds`,
        {
          exchange
        }
      );
      for (const { userId } of usersByExchange) {
        await this.queueJob({
          id: `${cpz.StatsCalcJobType.userSignalsAggr}-${exchange}-${userId}`,
          type: cpz.StatsCalcJobType.userSignalsAggr,
          userId,
          exchange
        });
      }
      const usersByAsset = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getSubscribedUserIds`,
        {
          asset
        }
      );
      for (const { userId } of usersByAsset) {
        await this.queueJob({
          id: `${cpz.StatsCalcJobType.userSignalsAggr}-${asset}-${userId}`,
          type: cpz.StatsCalcJobType.userSignalsAggr,
          userId,
          asset
        });
      }
      const usersByExchangeAsset = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getSubscribedUserIds`,
        {
          exchange,
          asset
        }
      );
      for (const { userId } of usersByExchangeAsset) {
        await this.queueJob({
          id: `${cpz.StatsCalcJobType.userSignalsAggr}-${exchange}-${asset}-${userId}`,
          type: cpz.StatsCalcJobType.userSignalsAggr,
          userId,
          exchange,
          asset
        });
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleStatsCalcUserRobotEvent(
    ctx: Context<cpz.StatsCalcUserRobotEvent>
  ) {
    try {
      const { userRobotId, userId, exchange, asset } = ctx.params;
      await this.queueJob({
        id: userRobotId,
        type: cpz.StatsCalcJobType.userRobot,
        userRobotId
      });
      await this.queueJob({
        id: `${cpz.StatsCalcJobType.userRobotAggr}-${userId}`,
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId
      });
      await this.queueJob({
        id: `${cpz.StatsCalcJobType.userRobotAggr}-${exchange}-${userId}`,
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId,
        exchange
      });
      await this.queueJob({
        id: `${cpz.StatsCalcJobType.userRobotAggr}-${asset}-${userId}`,
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId,
        asset
      });
      await this.queueJob({
        id: `${cpz.StatsCalcJobType.userRobotAggr}-${exchange}-${asset}-${userId}`,
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId,
        exchange,
        asset
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = StatsCalcRunnerService;

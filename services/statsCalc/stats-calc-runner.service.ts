import { Service, ServiceBroker, Context, Errors } from "moleculer";
import { v4 as uuid } from "uuid";
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
            tls: process.env.REDIS_TLS && {}
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
        calcRobot: {
          params: {
            robotId: "string",
            exchange: "string",
            asset: "string"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.handleStatsCalcRobotEvent
        },
        calcUserRobot: {
          params: {
            userRobotId: "string",
            userId: "string",
            exchange: "string",
            asset: "string"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.handleStatsCalcUserRobotEvent
        }
      },
      events: {
        [cpz.Event.STATS_CALC_USER_SIGNAL]: this.handleCalcUserSignalEvent,
        [cpz.Event.STATS_CALC_USER_SIGNALS]: this.handleCalcUserSignalsEvent,
        [cpz.Event.STATS_CALC_ROBOT]: this.handleStatsCalcRobotEvent,
        [cpz.Event.STATS_CALC_ROBOTS]: this.handleStatsCalcRobotsEvent,
        [cpz.Event.STATS_CALC_USER_ROBOT]: this.handleStatsCalcUserRobotEvent,
        [cpz.Event.STATS_CALC_USER_ROBOTS]: this.handleStatsCalcUserRobotsEvent
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
    const lastJob = await this.getQueue(cpz.Queue.statsCalc).getJob(job.id);
    if (lastJob) {
      const lastJobState = await lastJob.getState();
      if (["stuck", "completed", "failed"].includes(lastJobState))
        await lastJob.remove();
    }
    await this.createJob(cpz.Queue.statsCalc, job, {
      jobId: job.id,
      removeOnComplete: true,
      removeOnFail: true
    });
  }

  async handleCalcUserSignalEvent(
    ctx: Context<{ userId: string; robotId: string }>
  ) {
    try {
      const { userId, robotId } = ctx.params;
      const { exchange, asset } = await ctx.call(
        `${cpz.Service.DB_ROBOTS}.get`,
        {
          id: robotId
        }
      );
      const userSignal = await ctx.call(`${cpz.Service.DB_USER_SIGNALS}.find`, {
        query: {
          userId,
          robotId
        }
      });
      if (userSignal)
        await this.queueJob({
          id: uuid(),
          type: cpz.StatsCalcJobType.userSignal,
          userId,
          robotId
        });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userSignalsAggr,
        userId,
        exchange
      });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userSignalsAggr,
        userId,
        asset
      });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userSignalsAggr,
        userId,
        exchange,
        asset
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleCalcUserSignalsEvent(ctx: Context<{ userId: string }>) {
    try {
      const { userId } = ctx.params;
      const userSignals = await ctx.call(
        `${cpz.Service.DB_USER_SIGNALS}.find`,
        {
          query: {
            userId
          }
        }
      );
      if (
        !userSignals ||
        !Array.isArray(userSignals) ||
        userSignals.length === 0
      )
        return;

      for (const { robotId } of userSignals) {
        await this.queueJob({
          id: uuid(),
          type: cpz.StatsCalcJobType.userSignal,
          userId,
          robotId
        });
      }

      const exchangesAssets: {
        exchange: string;
        asset: string;
      }[] = await ctx.call(`${cpz.Service.DB_USER_SIGNALS}.getSubscribedAggr`, {
        userId
      });
      if (
        !exchangesAssets ||
        !Array.isArray(exchangesAssets) ||
        exchangesAssets.length === 0
      )
        return;
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userSignalsAggr,
        userId
      });

      const exchanges = [...new Set(exchangesAssets.map(e => e.exchange))];
      for (const exchange of exchanges) {
        await this.queueJob({
          id: uuid(),
          type: cpz.StatsCalcJobType.userSignalsAggr,
          userId,
          exchange
        });
      }

      const assets = [...new Set(exchangesAssets.map(e => e.asset))];
      for (const asset of assets) {
        await this.queueJob({
          id: uuid(),
          type: cpz.StatsCalcJobType.userSignalsAggr,
          userId,
          asset
        });
      }

      for (const { exchange, asset } of exchangesAssets) {
        await this.queueJob({
          id: uuid(),
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

  async handleStatsCalcRobotEvent(ctx: Context<cpz.StatsCalcRobotEvent>) {
    try {
      const { robotId } = ctx.params;
      this.logger.info(`New ${cpz.Event.STATS_CALC_ROBOT} event - ${robotId}`);
      const {
        exchange,
        asset
      }: { exchange: string; asset: string } = await ctx.call(
        `${cpz.Service.DB_ROBOTS}.get`,
        {
          id: robotId,
          fields: ["exchange", "asset"]
        }
      );
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.robot,
        robotId
      });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userSignals,
        robotId
      });

      const usersByRobotId = await ctx.call<
        { userId: string }[],
        { robotId: string }
      >(`${cpz.Service.DB_USER_SIGNALS}.getSubscribedUserIds`, {
        robotId
      });
      for (const { userId } of usersByRobotId) {
        await this.queueJob({
          id: uuid(),
          type: cpz.StatsCalcJobType.userSignalsAggr,
          userId
        });
      }

      const usersByExchange = await ctx.call<
        { userId: string }[],
        { exchange: string }
      >(`${cpz.Service.DB_USER_SIGNALS}.getSubscribedUserIds`, {
        exchange
      });
      for (const { userId } of usersByExchange) {
        await this.queueJob({
          id: uuid(),
          type: cpz.StatsCalcJobType.userSignalsAggr,
          userId,
          exchange
        });
      }

      const usersByAsset = await ctx.call<
        { userId: string }[],
        { asset: string }
      >(`${cpz.Service.DB_USER_SIGNALS}.getSubscribedUserIds`, {
        asset
      });
      for (const { userId } of usersByAsset) {
        await this.queueJob({
          id: uuid(),
          type: cpz.StatsCalcJobType.userSignalsAggr,
          userId,
          asset
        });
      }

      const usersByExchangeAsset = await ctx.call<
        { userId: string }[],
        { exchange: string; asset: string }
      >(`${cpz.Service.DB_USER_SIGNALS}.getSubscribedUserIds`, {
        exchange,
        asset
      });
      for (const { userId } of usersByExchangeAsset) {
        await this.queueJob({
          id: uuid(),
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

  async handleStatsCalcRobotsEvent(ctx: Context) {
    try {
      const startedRobots: {
        id: string;
        exchange: string;
        asset: string;
      }[] = await ctx.call(`${cpz.Service.DB_ROBOTS}.find`, {
        query: {
          status: cpz.Status.started
        },
        fields: ["id", "exchange", "asset"]
      });
      for (const { id: robotId, exchange, asset } of startedRobots) {
        await ctx.call(`${cpz.Service.STATS_CALC_RUNNER}.calcRobot`, {
          robotId,
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
      const { userRobotId } = ctx.params;
      this.logger.info(
        `New ${cpz.Event.STATS_CALC_USER_ROBOT} event - ${userRobotId}`
      );
      const { userId, robotId } = await ctx.call(
        `${cpz.Service.DB_USER_ROBOTS}.get`,
        {
          id: userRobotId,
          fields: ["userId", "robotId"]
        }
      );
      const { exchange, asset } = await ctx.call(
        `${cpz.Service.DB_ROBOTS}.get`,
        {
          id: robotId,
          fields: ["exchange", "asset"]
        }
      );
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userRobot,
        userRobotId
      });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId
      });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId,
        exchange
      });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId,
        asset
      });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId,
        exchange,
        asset
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleStatsCalcUserRobotsEvent(
    ctx: Context<cpz.StatsCalcUserRobotsEvent>
  ) {
    try {
      const { userId, exchange, asset } = ctx.params;
      this.logger.info(
        `New ${cpz.Event.STATS_CALC_USER_ROBOTS} event - ${userId}, ${exchange}, ${asset}`
      );
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId
      });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId,
        exchange
      });
      await this.queueJob({
        id: uuid(),
        type: cpz.StatsCalcJobType.userRobotAggr,
        userId,
        asset
      });
      await this.queueJob({
        id: uuid(),
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

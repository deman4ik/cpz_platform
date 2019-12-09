import { Service, ServiceBroker, Context } from "moleculer";
import QueueService from "moleculer-bull";
import { Job } from "bull";
import { cpz } from "../../@types";
import { calcStatistics, round } from "../../utils";
import dayjs from "../../lib/dayjs";

class StatsCalcWorkerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.STATS_CALC_WORKER,
      dependencies: [
        cpz.Service.DB_ROBOTS,
        cpz.Service.DB_USER_ROBOTS,
        cpz.Service.DB_ROBOT_POSITIONS,
        cpz.Service.DB_USER_POSITIONS,
        cpz.Service.DB_USER_SIGNALS,
        cpz.Service.DB_USER_AGGR_STATS
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
      queues: {
        [cpz.Queue.statsCalc]: {
          concurrency: 100,
          async process(job: Job<cpz.StatsCalcJob>) {
            await this.run(job.data);
            return { success: true, id: job.id };
          }
        }
      }
    });
  }

  async run(job: cpz.StatsCalcJob) {
    try {
      const { type, robotId, userRobotId, userId, exchange, asset } = job;
      this.logger.info(`Calculating`, job);
      if (type === cpz.StatsCalcJobType.robot) {
        await this.calcRobot(robotId);
      } else if (type === cpz.StatsCalcJobType.userRobot) {
        await this.calcUserRobot(userRobotId);
      } else if (type === cpz.StatsCalcJobType.userSignal) {
        await this.calcUserSignal(userId, robotId);
      } else if (type === cpz.StatsCalcJobType.userSignals) {
        await this.calcUserSignals(robotId);
      } else if (type === cpz.StatsCalcJobType.userSignalsAggr) {
        await this.calcUserSignalsAggr(userId, exchange, asset);
      } else if (type === cpz.StatsCalcJobType.userRobotAggr) {
        await this.calcUserRobotsAggr(userId, exchange, asset);
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async calcRobot(robotId: string) {
    const positions = await this.broker.call(
      `${cpz.Service.DB_ROBOT_POSITIONS}.find`,
      {
        query: {
          robotId,
          status: cpz.RobotPositionStatus.closed
        }
      }
    );
    const { statistics, equity } = calcStatistics(positions);
    await this.broker.call(`${cpz.Service.DB_ROBOTS}.update`, {
      id: robotId,
      statistics,
      equity
    });
  }

  async calcUserSignal(userId: string, robotId: string) {
    const [userSignal]: cpz.UserSignals[] = await this.broker.call(
      `${cpz.Service.DB_USER_SIGNALS}.find`,
      {
        query: {
          robotId,
          userId
        }
      }
    );
    if (userSignal) {
      const allPositions: cpz.RobotPositionState[] = await this.broker.call(
        `${cpz.Service.DB_ROBOT_POSITIONS}.find`,
        {
          query: {
            robotId,
            status: cpz.RobotPositionStatus.closed,
            entryDate: {
              $lte: userSignal.subscribedAt
            }
          }
        }
      );
      if (
        allPositions &&
        Array.isArray(allPositions) &&
        allPositions.length > 0
      ) {
        const positions = allPositions.filter(
          pos =>
            dayjs.utc(pos.entryDate).valueOf() >=
            dayjs.utc(userSignal.subscribedAt).valueOf()
        );
        if (positions.length > 0) {
          const signalPositions = positions.map(pos => {
            let profit: number = 0;
            if (pos.direction === cpz.PositionDirection.long) {
              profit = +round(
                (pos.exitPrice - pos.entryPrice) * userSignal.volume,
                6
              );
            } else {
              profit = +round(
                (pos.entryPrice - pos.exitPrice) * userSignal.volume,
                6
              );
            }
            return {
              ...pos,
              volume: userSignal.volume,
              profit
            };
          });
          const { statistics, equity } = calcStatistics(signalPositions);
          await this.broker.call(`${cpz.Service.DB_USER_SIGNALS}.update`, {
            id: userSignal.id,
            statistics,
            equity
          });
        }
      }
    }
  }

  async calcUserSignals(robotId: string) {
    const userSignals: cpz.UserSignals[] = await this.broker.call(
      `${cpz.Service.DB_USER_SIGNALS}.find`,
      {
        query: {
          robotId
        }
      }
    );
    if (userSignals && Array.isArray(userSignals) && userSignals.length > 0) {
      const minSubscriptionDate = dayjs
        .utc(
          Math.min(
            ...userSignals.map(us => dayjs.utc(us.subscribedAt).valueOf())
          )
        )
        .toISOString();

      const allPositions: cpz.RobotPositionState[] = await this.broker.call(
        `${cpz.Service.DB_ROBOT_POSITIONS}.find`,
        {
          query: {
            robotId,
            status: cpz.RobotPositionStatus.closed,
            entryDate: {
              $lte: minSubscriptionDate
            }
          }
        }
      );
      if (
        allPositions &&
        Array.isArray(allPositions) &&
        allPositions.length > 0
      ) {
        for (const userSignal of userSignals) {
          const positions = allPositions.filter(
            pos =>
              dayjs.utc(pos.entryDate).valueOf() >=
              dayjs.utc(userSignal.subscribedAt).valueOf()
          );
          if (positions.length > 0) {
            const signalPositions = positions.map(pos => {
              let profit: number = 0;
              if (pos.direction === cpz.PositionDirection.long) {
                profit = +round(
                  (pos.exitPrice - pos.entryPrice) * userSignal.volume,
                  6
                );
              } else {
                profit = +round(
                  (pos.entryPrice - pos.exitPrice) * userSignal.volume,
                  6
                );
              }
              return {
                ...pos,
                volume: userSignal.volume,
                profit
              };
            });
            const { statistics, equity } = calcStatistics(signalPositions);
            await this.broker.call(`${cpz.Service.DB_USER_SIGNALS}.update`, {
              id: userSignal.id,
              statistics,
              equity
            });
          }
        }
      }
    }
  }

  async calcUserSignalsAggr(userId: string, exchange?: string, asset?: string) {
    const userSignalPositions: cpz.UserSignalPosition[] = await this.broker.call(
      `${cpz.Service.DB_ROBOT_POSITIONS}.getUserSignalPositions`,
      {
        userId,
        exchange,
        asset
      }
    );

    if (
      userSignalPositions &&
      Array.isArray(userSignalPositions) &&
      userSignalPositions.length > 0
    ) {
      const signalPositions = userSignalPositions.map(pos => {
        let profit: number = 0;
        if (pos.direction === cpz.PositionDirection.long) {
          profit = +round(
            (pos.exitPrice - pos.entryPrice) * pos.userSignalVolume,
            6
          );
        } else {
          profit = +round(
            (pos.entryPrice - pos.exitPrice) * pos.userSignalVolume,
            6
          );
        }
        return {
          ...pos,
          volume: pos.userSignalVolume,
          profit
        };
      });
      const { statistics, equity } = calcStatistics(signalPositions);
      await this.broker.call(`${cpz.Service.DB_USER_AGGR_STATS}.upsert`, {
        userId,
        exchange,
        asset,
        type: "signal",
        statistics,
        equity
      });
    }
  }

  async calcUserRobot(userRobotId: string) {
    const positions = await this.broker.call(
      `${cpz.Service.DB_USER_POSITIONS}.find`,
      {
        query: {
          userRobotId,
          status: {
            $or: [
              cpz.UserPositionStatus.closed,
              cpz.UserPositionStatus.closedAuto
            ]
          }
        }
      }
    );
    const { statistics, equity } = calcStatistics(positions);
    await this.broker.call(`${cpz.Service.DB_USER_ROBOTS}.update`, {
      id: userRobotId,
      statistics,
      equity
    });
  }

  async calcUserRobotsAggr(userId: string, exchange?: string, asset?: string) {
    const positions = await this.broker.call(
      `${cpz.Service.DB_USER_POSITIONS}.find`,
      {
        query: {
          userId,
          exchange,
          asset
        }
      }
    );
    const { statistics, equity } = calcStatistics(positions);
    await this.broker.call(`${cpz.Service.DB_USER_AGGR_STATS}.upsert`, {
      userId,
      exchange,
      asset,
      type: "userRobot",
      statistics,
      equity
    });
  }
}

export = StatsCalcWorkerService;

import {
  Service,
  ServiceBroker,
  Context,
  Errors as ErrorsBase
} from "moleculer";
import { Errors } from "moleculer-web";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { v4 as uuid } from "uuid";
import { cpz } from "../../../@types";
import dayjs from "../../../lib/dayjs";
import {
  underscoreToCamelCaseKeys,
  round,
  getAccessValue,
  datesToISOString
} from "../../../utils";
import Auth from "../../../mixins/auth";

class UserSignalsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_SIGNALS,
      mixins: [Auth, DbService],
      adapter: SqlAdapter,
      model: {
        name: "user_signals",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          robotId: { type: Sequelize.UUID, field: "robot_id" },
          userId: { type: Sequelize.UUID, field: "user_id" },
          subscribedAt: {
            type: Sequelize.DATE,
            field: "subscribed_at",
            get: function() {
              const value = this.getDataValue("subscribedAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          volume: { type: Sequelize.NUMBER },
          statistics: { type: Sequelize.JSONB, allowNull: true },
          equity: { type: Sequelize.JSONB, allowNull: true }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
        getSubscribedAggr: {
          params: {
            userId: "string"
          },
          handler: this.getSubscribedAggr
        },
        getSubscribedUserIds: {
          params: {
            robotId: { type: "string", optional: true },
            exchange: { type: "string", optional: true },
            asset: { type: "string", optional: true },
            currency: { type: "string", optional: true }
          },
          handler: this.getSubscribedUserIds
        },
        getSignalRobots: {
          params: {
            exchange: { type: "string", optional: true },
            asset: { type: "string", optional: true },
            currency: { type: "string", optional: true },
            userId: { type: "string", optional: true }
          },
          handler: this.getSignalRobots
        },
        getSignalRobot: {
          params: {
            robotId: "string"
          },
          handler: this.getSignalRobot
        },
        getTelegramSubscriptions: {
          params: {
            robotId: "string"
          },
          handler: this.getTelegramSubscriptions
        },
        subscribe: {
          params: {
            robotId: "string",
            volume: "number"
          },
          graphql: {
            mutation:
              "userSignalSusbcribe(robotId: String!, volume: Float!): Response!"
          },
          roles: [cpz.UserRoles.user],
          handler: this.subscribe
        },
        unsubscribe: {
          params: {
            robotId: "string"
          },
          graphql: {
            mutation: "userSignalUnsusbcribe(robotId: String!): Response!"
          },
          roles: [cpz.UserRoles.user],
          handler: this.unsubscribe
        }
      }
    });
  }

  async getSubscribedAggr(ctx: Context<{ userId: string }>) {
    try {
      const { userId: user_id } = ctx.params;
      const query = `
  select r.exchange, r.asset from user_signals u, robots r 
  where u.robot_id = r.id 
    and u.user_id = :user_id
  group by r.exchange, r.asset`;

      return await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { user_id }
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getSubscribedUserIds(
    ctx: Context<{
      robotId?: string;
      exchange?: string;
      asset?: string;
      currency?: string;
    }>
  ) {
    try {
      const { robotId, exchange, asset, currency } = ctx.params;
      const params: {
        robot_id?: string;
        exchange?: string;
        asset?: string;
        currency?: string;
      } = {};
      const query = `SELECT us.user_id
                     FROM robots r, user_signals us
                     WHERE us.robot_id = r.id
                     ${robotId ? "AND r.id = :robot_id" : ""}
                     ${exchange ? "AND r.exchange = :exchange" : ""}
                     ${asset ? "AND r.asset = :asset" : ""}
                     ${currency ? "AND r.currency = :currency" : ""}
                     GROUP BY us.user_id;`;

      if (robotId) params.robot_id = robotId;
      if (exchange) params.exchange = exchange;
      if (asset) params.asset = asset;
      if (currency) params.currency = currency;
      const rawUserIds = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: params
      });

      return underscoreToCamelCaseKeys(rawUserIds);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getSignalRobots(
    ctx: Context<
      {
        exchange?: string;
        asset?: string;
        currency?: string;
        userId?: string;
      },
      { user: cpz.User }
    >
  ) {
    try {
      const { id: user_id } = ctx.meta.user;
      const available = getAccessValue(ctx.meta.user);
      const { exchange, asset, currency, userId } = ctx.params;
      const params: {
        user_id?: string;
        exchange?: string;
        asset?: string;
        currency?: string;
        available: number;
      } = {
        user_id,
        available
      };
      const query = `
      SELECT t.id, t.code, t.name, s.user_id
      FROM  robots t  
      LEFT JOIN user_signals s 
      ON s.robot_id = t.id AND s.user_id = :user_id
      WHERE t.signals = true
      AND t.available >= :available
      ${exchange ? "AND t.exchange = :exchange" : ""}
      ${asset ? "AND t.asset = :asset" : ""}
      ${currency ? "AND t.currency = :currency" : ""}
      ${userId ? "AND s.user_id = :user_id" : ""}
      ;`;

      if (exchange) params.exchange = exchange;
      if (asset) params.asset = asset;
      if (currency) params.currency = currency;
      const rawData = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: params
      });
      return rawData.map(
        (r: { id: string; name: string; user_id?: string }) => ({
          id: r.id,
          name: r.name,
          subscribed: !!r.user_id
        })
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getSignalRobot(
    ctx: Context<{ robotId: string }, { user: cpz.User }>
  ): Promise<{
    robotInfo: cpz.RobotInfo;
    userSignalsInfo?: cpz.UserSignalsInfo;
    market: cpz.Market;
  }> {
    try {
      const { robotId } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const robotInfo: cpz.RobotInfo = await ctx.call(
        `${cpz.Service.DB_ROBOTS}.getRobotInfo`,
        {
          id: robotId
        },
        {
          meta: {
            user: ctx.meta.user
          }
        }
      );
      const accessValue = getAccessValue(ctx.meta.user);
      if (robotInfo.available < accessValue)
        throw new Errors.ForbiddenError("FORBIDDEN", { robotId });
      const [subscription]: cpz.UserSignals[] = await this._find(ctx, {
        query: {
          robotId,
          userId
        }
      });

      let userSignalsInfo: cpz.UserSignalsInfo;
      if (subscription) {
        let openPositions: cpz.RobotPositionState[] = [];
        let closedPositions: cpz.RobotPositionState[] = [];
        let currentSignals: cpz.UserSignalInfo[] = [];
        if (
          robotInfo.openPositions &&
          Array.isArray(robotInfo.openPositions) &&
          robotInfo.openPositions.length > 0
        ) {
          openPositions = robotInfo.openPositions.filter(
            pos =>
              dayjs.utc(pos.entryDate).valueOf() >=
              dayjs.utc(subscription.subscribedAt).valueOf()
          );
        }
        if (
          robotInfo.closedPositions &&
          Array.isArray(robotInfo.closedPositions) &&
          robotInfo.closedPositions.length > 0
        ) {
          closedPositions = robotInfo.closedPositions
            .filter(
              pos =>
                dayjs.utc(pos.entryDate).valueOf() >=
                dayjs.utc(subscription.subscribedAt).valueOf()
            )
            .map(pos => {
              let profit: number = 0;
              if (pos.direction === cpz.PositionDirection.long) {
                profit = +round(
                  (pos.exitPrice - pos.entryPrice) * subscription.volume,
                  6
                );
              } else {
                profit = +round(
                  (pos.entryPrice - pos.exitPrice) * subscription.volume,
                  6
                );
              }
              return {
                ...pos,
                volume: subscription.volume,
                profit
              };
            });
        }
        if (
          robotInfo.currentSignals &&
          Array.isArray(robotInfo.currentSignals) &&
          robotInfo.currentSignals.length > 0
        ) {
          robotInfo.currentSignals.forEach(signal => {
            if (
              signal.action === cpz.TradeAction.long ||
              signal.action === cpz.TradeAction.short
            ) {
              if (
                dayjs.utc(signal.candleTimestamp).valueOf() >=
                dayjs.utc(subscription.subscribedAt).valueOf()
              )
                currentSignals.push(signal);
            } else {
              const position = openPositions.find(
                pos => pos.code === signal.code
              );
              if (position) currentSignals.push(signal);
            }
          });
        }
        userSignalsInfo = {
          ...subscription,
          openPositions,
          closedPositions,
          currentSignals
        };
      }

      const [market] = await ctx.call(`${cpz.Service.DB_MARKETS}.find`, {
        query: {
          exchange: robotInfo.exchange,
          asset: robotInfo.asset,
          currency: robotInfo.currency
        }
      });
      return {
        robotInfo,
        userSignalsInfo,
        market
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getTelegramSubscriptions(ctx: Context<{ robotId: string }>) {
    try {
      const { robotId: robot_id } = ctx.params;
      const query = `SELECT u.telegram_id,
                            s.user_id,
                            s.volume,
                            s.subscribed_at
                     FROM user_signals s, users u
                     WHERE s.user_id = u.id
                     AND u.telegram_id IS NOT NULL
                     AND u.settings -> 'notifications' -> 'signals' ->> 'telegram' = 'true'
                     AND s.robot_id = :robot_id ;`;
      const subscribtionsRaw = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { robot_id }
      });
      return underscoreToCamelCaseKeys(datesToISOString(subscribtionsRaw));
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async subscribe(
    ctx: Context<{ robotId: string; volume: number }, { user: cpz.User }>
  ) {
    try {
      this.authAction(ctx);
      const { robotId, volume } = ctx.params;
      const { exchange, asset, currency, available } = await ctx.call(
        `${cpz.Service.DB_ROBOTS}.get`,
        {
          id: robotId,
          fields: ["exchange", "asset", "currency", "available"]
        }
      );
      const accessValue = getAccessValue(ctx.meta.user);
      if (available < accessValue)
        throw new Errors.ForbiddenError("FORBIDDEN", { robotId });

      const [market]: cpz.Market[] = await ctx.call(
        `${cpz.Service.DB_MARKETS}.find`,
        {
          query: {
            exchange,
            asset,
            currency
          }
        }
      );
      if (volume < market.limits.amount.min)
        throw new ErrorsBase.ValidationError(
          `Wrong volume value must be more than ${market.limits.amount.min}`
        );

      if (volume > market.limits.amount.max)
        throw new ErrorsBase.ValidationError(
          `Wrong volume value must be less than ${market.limits.amount.max}`
        );
      const { id: userId } = ctx.meta.user;
      const [subscribed]: cpz.UserSignals[] = await this._find(ctx, {
        fields: ["id"],
        query: {
          robotId,
          userId
        }
      });
      if (subscribed) {
        await this.adapter.updateById(subscribed.id, {
          $set: {
            volume
          }
        });
      } else {
        await this.adapter.insert({
          id: uuid(),
          robotId,
          userId,
          volume,
          subscribedAt: dayjs.utc().toISOString()
        });
      }
      await ctx.emit<{ userId: string; robotId: string }>(
        cpz.Event.STATS_CALC_USER_SIGNAL,
        {
          userId,
          robotId
        }
      );
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async unsubscribe(ctx: Context<{ robotId: string }, { user: cpz.User }>) {
    try {
      this.authAction(ctx);
      const { robotId } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const [subscribed] = await this._find(ctx, {
        fields: ["id"],
        query: {
          robotId,
          userId
        }
      });
      if (subscribed) {
        await this.adapter.removeById(subscribed.id);
        await ctx.emit<{ userId: string; robotId: string }>(
          cpz.Event.STATS_CALC_USER_SIGNAL,
          {
            userId,
            robotId
          }
        );
      }
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }
}

export = UserSignalsService;

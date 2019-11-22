import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { v4 as uuid } from "uuid";
import { cpz } from "../../../@types";
import dayjs from "../../../lib/dayjs";
import { underscoreToCamelCaseKeys } from "../../../utils/helpers";

class UserSignalsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_SIGNALS,
      mixins: [DbService],
      adapter: SqlAdapter,
      dependencies: [`${cpz.Service.DB_ROBOTS}`],
      model: {
        name: "user_signals",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          robotId: { type: Sequelize.UUID, field: "robot_id" },
          userId: { type: Sequelize.UUID, field: "user_id" },
          telegram: { type: Sequelize.BOOLEAN },
          email: { type: Sequelize.BOOLEAN },
          subscribedAt: {
            type: Sequelize.DATE,
            field: "subscribed_at",
            get: function() {
              const value = this.getDataValue("subscribedAt");
              return (value && value.toISOString()) || value;
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
            robotId: "string"
          },
          handler: this.subscribe
        },
        unsubscribe: {
          params: {
            robotId: "string"
          },
          handler: this.unsubscribe
        }
      }
    });
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
      if (!rawUserIds || !Array.isArray(rawUserIds) || rawUserIds.length === 0)
        return [];
      const userIds = rawUserIds.map(u => underscoreToCamelCaseKeys(u));
      return userIds;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  async getSignalRobots(ctx: Context<null, { user: cpz.User }>) {
    try {
      const { id: user_id } = ctx.meta.user;
      const query = `SELECT t.id, t.name
        FROM robots t right outer join user_signals s ON s.robot_id = t.id
        WHERE s.user_id = :user_id;`;
      return await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { user_id }
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getSignalRobot(ctx: Context<{ robotId: string }, { user: cpz.User }>) {
    try {
      const { robotId } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const robot = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.getRobotInfo`,
        {
          id: robotId
        }
      );
      const [subscription] = await this.adapter.find({
        query: {
          robotId,
          userId
        }
      });

      return {
        robot,
        subscription: {
          telegram: subscription && subscription.telegram,
          email: subscription && subscription.email
        }
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getTelegramSubscriptions(ctx: Context<{ robotId: string }>) {
    try {
      const { robotId: robot_id } = ctx.params;
      const query = `select u.telegram_id, s.user_id 
      from user_signals s 
      inner join users u on s.user_id = u.id 
      where s.robot_id = :robot_id 
        and s.telegram = true 
        and u.telegram_id is not null;`;
      const subscribtionsRaw = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { robot_id }
      });
      if (
        !subscribtionsRaw ||
        !Array.isArray(subscribtionsRaw) ||
        subscribtionsRaw.length === 0
      )
        return [];
      return subscribtionsRaw.map(sub => underscoreToCamelCaseKeys(sub));
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  //TODO: email subscription
  //TODO: volume
  async subscribe(ctx: Context<{ robotId: string }, { user: cpz.User }>) {
    try {
      const { robotId } = ctx.params;
      const { id: userId } = ctx.meta.user;
      await this.adapter.insert({
        id: uuid(),
        robotId,
        userId,
        telegram: true,
        email: false,
        subscribedAt: dayjs.utc().toISOString()
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async unsubscribe(ctx: Context<{ robotId: string }, { user: cpz.User }>) {
    try {
      const { robotId } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const [subscription] = await this.adapter.find({
        fields: ["id"],
        query: {
          robotId,
          userId
        }
      });
      if (subscription) await this.adapter.removeById(subscription.id);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = UserSignalsService;

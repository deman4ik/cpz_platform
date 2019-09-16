import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { v4 as uuid } from "uuid";
import { cpz } from "../../../types/cpz";
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
          subscribedAt: { type: Sequelize.STRING, field: "subscribed_at" },
          volume: { type: Sequelize.NUMBER, allowNull: true }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
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

  async getSignalRobots(ctx: Context) {
    try {
      const { id: user_id } = ctx.meta.user;
      const query = `select  t.id,
        t.name
        from robots t right outer join user_signals s ON s.robot_id = t.id
        where s.user_id = :user_id;`;
      return await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { user_id }
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getSignalRobot(ctx: Context) {
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

  async getTelegramSubscriptions(ctx: Context) {
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
  async subscribe(ctx: Context) {
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

  async unsubscribe(ctx: Context) {
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

import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";

class UserRobotHistoryService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_ROBOT_HISTORY,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "user_robot_history",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          userRobotId: { type: Sequelize.STRING, field: "user_robot_id" },
          type: Sequelize.STRING,
          data: { type: Sequelize.JSONB, allowNull: true }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      events: {
        ["user-robot.*"]: this.handleUserRobotEvents,
        [cpz.Event.ORDER_ERROR]: this.handleUserRobotEvents
      }
    });
  }

  async handleUserRobotEvents(
    ctx: Context<cpz.UserRobotEventData | cpz.Order>
  ) {
    try {
      const { userRobotId } = ctx.params;
      await this.adapter.insert({
        id: uuid(),
        userRobotId,
        type: ctx.eventName,
        data: ctx.params
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = UserRobotHistoryService;

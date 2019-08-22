import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";

class RobotHistoryService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_ROBOT_HISTORY,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "robot_history",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          robotId: { type: Sequelize.STRING, field: "robot_id" },
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
        [cpz.Event.ROBOT_STARTED]: this.handleRobotEvents,
        [cpz.Event.ROBOT_STOPPED]: this.handleRobotEvents,
        [cpz.Event.ROBOT_FAILED]: this.handleRobotEvents
      }
    });
  }

  async handleRobotEvents(ctx: Context) {
    try {
      const { type, data, data: robotId } = ctx.params;
      await this.adapter.insert({
        robotId,
        type,
        data
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = RobotHistoryService;

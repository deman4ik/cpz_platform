import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class RobotHistoryService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_ROBOT_HISTORY,
      mixins: [DbService],
      adapter:
        process.env.NODE_ENV === "production"
          ? new SqlAdapter(
              process.env.PG_DBNAME,
              process.env.PG_USER,
              process.env.PG_PWD,
              adapterOptions
            )
          : adapter,
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
        ["robot.*"]: this.handleRobotEvents
      }
    });
  }

  async handleRobotEvents(ctx: Context<cpz.RobotEventData>) {
    try {
      const { robotId } = ctx.params;
      await this.adapter.insert({
        id: uuid(),
        robotId,
        type: ctx.eventName,
        data: ctx.params
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = RobotHistoryService;

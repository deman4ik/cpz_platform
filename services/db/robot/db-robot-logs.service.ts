import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class RobotLogsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_ROBOT_LOGS,
      mixins: [DbService],
      adapter,
      model: {
        name: "robot_logs",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          robotId: { type: Sequelize.STRING, field: "robot_id" },
          data: { type: Sequelize.JSONB }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      events: {
        [cpz.Event.ROBOT_LOG]: this.handleRobotLog
      }
    });
  }

  async handleRobotLog(
    ctx: Context<{
      robotId: string;
      [key: string]: any;
    }>
  ) {
    try {
      const { robotId } = ctx.params;
      await this.adapter.insert({
        id: uuid(),
        robotId,
        data: ctx.params
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = RobotLogsService;

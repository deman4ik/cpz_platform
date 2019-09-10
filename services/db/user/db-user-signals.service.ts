import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";

class UserSignalsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_SIGNALS,
      mixins: [DbService],
      adapter: SqlAdapter,
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
      }
    });
  }
}

export = UserSignalsService;

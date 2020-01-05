import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";

class StrategiesService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_STRATEGIES,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "strategies",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
          code: { type: Sequelize.STRING },
          name: { type: Sequelize.STRING },
          description: { type: Sequelize.TEXT, allowNull: true },
          author: { type: Sequelize.STRING, allowNull: true },
          available: Sequelize.INTEGER,
          file: Sequelize.TEXT
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

export = StrategiesService;

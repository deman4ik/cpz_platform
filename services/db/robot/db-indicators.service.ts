import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";

class IndicatorsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_INDICATORS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "indicators",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          name: { type: Sequelize.STRING },
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

export = IndicatorsService;

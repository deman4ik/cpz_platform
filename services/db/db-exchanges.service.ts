import { Service, ServiceBroker } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../@types";

class ExchangesService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_EXCHANGES,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "exchanges",
        define: {
          code: { type: Sequelize.STRING, primaryKey: true },
          name: { type: Sequelize.STRING },
          timeframes: { type: Sequelize.JSONB, allowNull: true },
          countries: { type: Sequelize.JSONB, allowNull: true },
          options: { type: Sequelize.JSONB, allowNull: true },
          available: Sequelize.INTEGER,
          type: { type: Sequelize.STRING, allowNull: true }
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

export = ExchangesService;

import { Service, ServiceBroker } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../@types";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class ExchangesService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_EXCHANGES,
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

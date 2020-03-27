import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class IndicatorsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_INDICATORS,
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

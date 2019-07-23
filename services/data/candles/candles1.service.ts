import { ServiceSchema } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "moleculer-db-adapter-sequelize";
import Sequelize from "sequelize";

const CandlesService: ServiceSchema = {
  name: "candles1",
  mixins: [DbService],
  adapter: new SqlAdapter(
    process.env.PG_DBNAME,
    process.env.PG_USER,
    process.env.PG_PWD,
    {
      dialect: "postgres",
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      dialectOptions: {
        ssl: true
      },
      logging: false
    }
  ),
  model: {
    name: "candles1",
    define: {
      id: { type: Sequelize.UUID, primaryKey: true },
      exchange: Sequelize.STRING,
      asset: Sequelize.STRING,
      currency: Sequelize.STRING,
      time: Sequelize.BIGINT,
      timestamp: Sequelize.DATE,
      open: Sequelize.DOUBLE,
      high: Sequelize.DOUBLE,
      low: Sequelize.DOUBLE,
      close: Sequelize.DOUBLE,
      volume: Sequelize.DOUBLE,
      type: Sequelize.STRING
    },
    options: {
      freezeTableName: true,
      timestamps: false
      // Options from http://docs.sequelizejs.com/manual/tutorial/models-definition.html
    }
  }
};

export = CandlesService;

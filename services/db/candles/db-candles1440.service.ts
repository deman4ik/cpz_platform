import { ServiceSchema, Context, Errors } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import SqlAdapter from "moleculer-db-adapter-sequelize";

const CandlesService: ServiceSchema = {
  name: `${cpz.Service.DB_CANDLES}1440`,
  mixins: [DbService],
  adapter,
  model: {
    name: "candles1440",
    define: {
      id: { type: Sequelize.UUID, primaryKey: true },
      exchange: Sequelize.STRING,
      asset: Sequelize.STRING,
      currency: Sequelize.STRING,
      time: Sequelize.BIGINT,
      timestamp: {
        type: Sequelize.DATE,
        get: function () {
          const value = this.getDataValue("timestamp");
          return (
            (value && value instanceof Date && value.toISOString()) || value
          );
        }
      },
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
  },
  actions: {
    upsert: {
      params: {
        entities: {
          type: "array",
          items: {
            type: "object",
            props: {
              exchange: { type: "string" },
              asset: { type: "string" },
              currency: { type: "string" },
              time: { type: "number" },
              timestamp: {
                type: "string"
              },
              open: { type: "number" },
              high: { type: "number" },
              low: { type: "number" },
              close: { type: "number" },
              volume: { type: "number" },
              type: { type: "string" }
            }
          }
        }
      },
      async handler(ctx: Context<{ entities: cpz.Candle[] }>) {
        try {
          const values = ctx.params.entities.map((candle: cpz.DBCandle) => {
            const val = {
              exchange: candle.exchange,
              asset: candle.asset,
              currency: candle.currency,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: candle.volume,
              time: candle.time,
              timestamp: candle.timestamp,
              type: candle.type
            };
            return Object.values(val);
          });

          const query = `INSERT INTO candles1440 (exchange, asset, currency, open, high, low, close, volume, time, timestamp, type) VALUES
          ${values
            .map((_) => {
              return "(?)";
            })
            .join(",")} 
           ON CONFLICT ON CONSTRAINT candles1440_time_exchange_asset_currency_key 
           DO UPDATE SET open = excluded.open,
           high = excluded.high,
           low = excluded.low,
           close = excluded.close,
           volume = excluded.volume,
           type = excluded.type;`;

          await this.adapter.db.query(query, {
            type: Sequelize.QueryTypes.INSERT,
            replacements: values
          });

          return true;
        } catch (e) {
          this.logger.error(e);
          throw e;
        }
      }
    }
  }
};

export = CandlesService;

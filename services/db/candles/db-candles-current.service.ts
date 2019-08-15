import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";

class CandlesCurrentService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_CANDLES_CURRENT,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "candles_current",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
          exchange: Sequelize.STRING,
          asset: Sequelize.STRING,
          currency: Sequelize.STRING,
          timeframe: Sequelize.INTEGER,
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
          timestamps: true,
          createdAt: false,
          updatedAt: "updated_at"
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
                  id: {
                    description: "Uniq Candle Id.",
                    type: "string",
                    empty: false
                  },
                  exchange: { type: "string" },
                  asset: { type: "string" },
                  currency: { type: "string" },
                  timeframe: { type: "number" },
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
          handler: this.upsert
        }
      }
    });
  }

  async upsert(ctx: Context) {
    try {
      const values = ctx.params.entities.map((candle: cpz.Candle) => {
        const val = {
          id: candle.id,
          exchange: candle.exchange,
          asset: candle.asset,
          currency: candle.currency,
          timeframe: candle.timeframe,
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

      const query = `INSERT INTO candles_current (id, exchange, asset, currency, timeframe, open, high, low, close, volume, time, timestamp, type) VALUES
        ${values
          .map((_: cpz.Candle) => {
            return "(?)";
          })
          .join(",")} 
         ON CONFLICT ON CONSTRAINT candles_current_exchange_asset_currency_timeframe_key
         DO UPDATE SET updated_at = now(),
         open = excluded.open,
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
      throw new Errors.MoleculerRetryableError(e.message, 500, this.name, e);
    }
  }
}

export = CandlesCurrentService;

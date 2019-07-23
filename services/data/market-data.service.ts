import { ServiceSchema, Errors } from "moleculer";
import DBClient from "../../mixins/DB-client";
import Timeframe from "../../utils/timeframe";
import { cpz } from "../../types/cpz";

const MarketDataService: ServiceSchema = {
  name: "market-data",
  mixins: [DBClient],

  /**
   * Service settings
   */
  settings: {},

  /**
   * Service dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    saveCandles: {
      params: {
        timeframe: {
          description: "Timeframe in minutes.",
          type: "enum",
          values: Timeframe.validArray
        },
        candles: {
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
              timeframe: {
                type: "enum",
                values: Timeframe.validArray
              },
              time: { type: "number" },
              timestamp: {
                type: "string"
              },
              open: { type: "number" },
              high: { type: "number" },
              low: { type: "number" },
              close: { type: "number" },
              volume: { type: "number" }
            }
          }
        }
      },
      async handler(ctx) {
        try {
          const { timeframe, candles } = ctx.params;
          const query = `mutation insert_candles${timeframe}($objects: [candles${timeframe}_insert_input!]!) {
              insert_candles${timeframe}(
                objects: $objects
                on_conflict: { 
                  constraint: candles${timeframe}_time_exchange_asset_currency_key
                  update_columns: [open, high, low, close, volume, type] 
              }) {
                affected_rows
              }
            }
            `;

          const variables = {
            objects: candles.map((candle: cpz.DBCandle) => ({
              id: candle.id,
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
            }))
          };
          const response = await this.DB.request(query, variables);
          return response;
        } catch (e) {
          this.logger.error(e);
          throw new Errors.MoleculerRetryableError(
            "Failed to save candles.",
            500,
            this.name,
            e
          );
        }
      }
    }
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {},

  /**
   * Service created lifecycle event handler
   */
  created() {}

  /**
   * Service started lifecycle event handler
   */
  // started() {

  // },

  /**
   * Service stopped lifecycle event handler
   */
  // stopped() {

  // },
};

export = MarketDataService;

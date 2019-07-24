import { ServiceSchema, Errors } from "moleculer";
import ccxt from "ccxt";
import retry from "async-retry";
import { PUBLIC_CONNECTOR } from "../../config";
import { cpz } from "../../types/cpz";
import dayjs from "../../lib/dayjs";
import {
  createFetchMethod,
  getCurrentCandleParams,
  getCandlesParams,
  handleCandleGaps,
  batchCandles,
  sortAsc,
  createDatesListWithRange
} from "../../utils";
import Timeframe from "../../utils/timeframe";

const PublicConnectorService: ServiceSchema = {
  name: PUBLIC_CONNECTOR,

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
    /**
     * Welcome a username
     *
     * @param {String} name - User name
     */
    getMarket: {
      params: {
        exchange: "string",
        asset: "string",
        currency: "string"
      },
      async handler(ctx) {
        return this.getMarket(ctx.params);
      }
    },
    getTimeframes: {
      params: {
        exchange: "string"
      },
      async handler(ctx) {
        return this.getTimeframes(ctx.params.exchange);
      }
    },
    getCurrentPrice: {
      params: {
        exchange: "string",
        asset: "string",
        currency: "string"
      },
      async handler(ctx): Promise<cpz.ExchangePrice> {
        return this.getCurrentPrice(ctx.params);
      }
    },
    getCurrentCandle: {
      params: {
        exchange: "string",
        asset: "string",
        currency: "string",
        timeframe: {
          description: "Timeframe in minutes.",
          type: "enum",
          values: Timeframe.validArray
        }
      },
      async handler(ctx): Promise<cpz.ExchangeCandle> {
        return this.getCurrentCandle(ctx.params);
      }
    },
    getCandles: {
      params: {
        exchange: "string",
        asset: "string",
        currency: "string",
        timeframe: {
          description: "Timeframe in minutes.",
          type: "enum",
          values: Timeframe.validArray
        },
        dateFrom: "string",
        limit: "number"
      },
      async handler(ctx): Promise<cpz.ExchangeCandle[]> {
        return this.getCandles(ctx.params);
      }
    },
    getTrades: {
      params: {
        exchange: "string",
        asset: "string",
        currency: "string",
        dateFrom: "string"
      },
      async handler(ctx): Promise<cpz.ExchangeTrade[]> {
        return this.getTrades(ctx.params);
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
  methods: {
    /**
     * Initialize public CCXT instance
     *
     * @param {cpz.ExchangeName} exchange
     * @returns {Promise<void>}
     */
    async initConnector(exchange: cpz.ExchangeName): Promise<void> {
      if (!(exchange in this.publicConnectors)) {
        this.publicConnectors[exchange] = new ccxt[exchange]({
          fetchImplementation: this._fetch
        });
        const call = async (bail: (e: Error) => void) => {
          try {
            return await this.publicConnectors[exchange].loadMarkets();
          } catch (e) {
            if (e instanceof ccxt.NetworkError) throw e;
            bail(e);
          }
        };
        await retry(call, this.retryOptions);
      }
    },

    /**
     * Form currency pair symbol
     *
     * @param {string} asset
     * @param {string} currency
     * @returns {string}
     */
    getSymbol(asset: string, currency: string): string {
      return `${asset}/${currency}`;
    },

    /**
     * Get currency market properties
     *
     * @param {cpz.AssetSymbol} { exchange, asset, currency }
     * @returns
     */
    async getMarket({ exchange, asset, currency }: cpz.AssetSymbol) {
      await this.initConnector(exchange);
      const response: ccxt.Market = await this.publicConnectors[
        exchange
      ].market(this.getSymbol(asset, currency));
      return {
        exchange,
        asset,
        currency,
        amountLimits: {
          min: response.limits.amount.min,
          max: response.limits.amount.max
        },
        priceLimits: {
          min: response.limits.price.min,
          max: response.limits.price.max
        },
        costLimits: {
          min: response.limits.cost.min,
          max: response.limits.cost.max
        },
        pricePrecision: response.precision.price,
        amountPrecision: response.precision.amount
      };
    },

    /**
     * Get exchange timeframes
     *
     * @param {cpz.ExchangeName} exchange
     * @returns {Promise<cpz.ExchangeTimeframes>}
     */
    async getTimeframes(
      exchange: cpz.ExchangeName
    ): Promise<cpz.ExchangeTimeframes> {
      await this.initConnector(exchange);
      const timeframes: cpz.ExchangeTimeframes = {};

      Object.keys(this.publicConnectors[exchange].timeframes).forEach(key => {
        const timeframe = Timeframe.stringToTimeframe(key);
        if (timeframe) timeframes[key] = timeframe;
      });
      return timeframes;
    },
    async getCurrentPrice({
      exchange,
      asset,
      currency
    }: cpz.AssetSymbol): Promise<cpz.ExchangePrice> {
      await this.initConnector(exchange);
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.publicConnectors[exchange].fetchTicker(
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      const response: ccxt.Ticker = await retry(call, this.retryOptions);
      if (!response) return null;
      const time = dayjs.utc(response.timestamp);
      return {
        exchange,
        asset,
        currency,
        time: time.valueOf(),
        timestamp: time.toISOString(),
        price: response.close
      };
    },

    /**
     * Get current open candle
     *
     * @param {cpz.CandleParams} {
     *       exchange,
     *       asset,
     *       currency,
     *       timeframe
     *     }
     * @returns {Promise<cpz.ExchangeCandle>}
     */
    async getCurrentCandle({
      exchange,
      asset,
      currency,
      timeframe
    }: cpz.CandleParams): Promise<cpz.ExchangeCandle> {
      await this.initConnector(exchange);
      const params = getCurrentCandleParams(
        this.publicConnectors[exchange].timeframes,
        timeframe
      );
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.publicConnectors[exchange].fetchOHLCV(
            this.getSymbol(asset, currency),
            params.timeframeStr,
            params.dateFrom,
            params.limit
          );
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      const response: ccxt.OHLCV[] = await retry(call, this.retryOptions);
      if (!response || !Array.isArray(response) || response.length === 0) {
        const { price } = await this.getCurrentPrice({
          exchange,
          asset,
          currency
        });
        if (!price) return null;
        const time = dayjs.utc(params.time);
        return {
          exchange,
          asset,
          currency,
          timeframe,
          time: time.valueOf(),
          timestamp: time.toISOString(),
          open: price,
          high: price,
          low: price,
          close: price,
          volume: 0,
          type: cpz.CandleType.previous
        };
      }
      let candles: cpz.ExchangeCandle[] = response.map(candle => ({
        exchange,
        asset,
        currency,
        timeframe: params.timeframe,
        time: +candle[0],
        timestamp: dayjs.utc(+candle[0]).toISOString(),
        open: +candle[1],
        high: +candle[2],
        low: +candle[3],
        close: +candle[4],
        volume: +candle[5],
        type: +candle[5] === 0 ? cpz.CandleType.previous : cpz.CandleType.loaded
      }));

      if (candles.length > 0 && params.batch) {
        const time = dayjs.utc(params.time);
        candles = [
          {
            exchange,
            asset,
            currency,
            timeframe,
            time: time.valueOf(),
            timestamp: time.toISOString(),
            open: +candles[0].open,
            high: Math.max(...candles.map(t => +t.high)),
            low: Math.min(...candles.map(t => +t.low)),
            close: +candles[candles.length - 1].close,
            volume: +candles.map(t => t.volume).reduce((a, b) => a + b),
            type: cpz.CandleType.created
          }
        ];
      }
      return candles[candles.length - 1];
    },

    /**
     * Load candles in timeframes
     *
     * @param {cpz.CandlesFetchParams} {
     *       exchange,
     *       asset,
     *       currency,
     *       timeframe,
     *       dateFrom,
     *       limit
     *     }
     * @returns {Promise<cpz.ExchangeCandle[]>}
     */
    async getCandles({
      exchange,
      asset,
      currency,
      timeframe,
      dateFrom,
      limit
    }: cpz.CandlesFetchParams): Promise<cpz.ExchangeCandle[]> {
      await this.initConnector(exchange);
      const params = getCandlesParams(
        this.publicConnectors[exchange].timeframes,
        timeframe,
        dateFrom,
        limit
      );
      const dateTo = dayjs.utc(params.dateTo);
      let candles: cpz.ExchangeCandle[] = [];
      /*
        exchange === "kraken" &&
        ((timeframe === cpz.Timeframe["1m"] &&
          dayjs.utc().diff(dayjs.utc(params.dateFrom), cpz.TimeUnit.hour) >
            10) ||
          (timeframe === cpz.Timeframe["5m"] &&
            dayjs.utc().diff(dayjs.utc(params.dateFrom), cpz.TimeUnit.day) >
              1) ||
          (timeframe === cpz.Timeframe["15m"] &&
            dayjs.utc().diff(dayjs.utc(params.dateFrom), cpz.TimeUnit.day) >
              5) ||
          (timeframe === cpz.Timeframe["30m"] &&
            dayjs.utc().diff(dayjs.utc(params.dateFrom), cpz.TimeUnit.day) >
              14) ||
          ((timeframe === cpz.Timeframe["1h"] ||
            timeframe === cpz.Timeframe["2h"]) &&
            dayjs.utc().diff(dayjs.utc(params.dateFrom), cpz.TimeUnit.day) >
              29))
     */
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.publicConnectors[exchange].fetchOHLCV(
            this.getSymbol(asset, currency),
            params.timeframeStr,
            params.dateFrom,
            params.limit
          );
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      const response: ccxt.OHLCV[] = await retry(call, this.retryOptions);
      if (!response || !Array.isArray(response) || response.length === 0)
        return candles;

      candles = response.map(candle => ({
        exchange,
        asset,
        currency,
        timeframe: params.timeframe,
        time: +candle[0],
        timestamp: dayjs.utc(+candle[0]).toISOString(),
        open: +candle[1],
        high: +candle[2],
        low: +candle[3],
        close: +candle[4],
        volume: +candle[5],
        type: +candle[5] === 0 ? cpz.CandleType.previous : cpz.CandleType.loaded
      }));

      candles = handleCandleGaps(dateFrom, dateTo.toISOString(), candles);
      if (params.batch && timeframe > cpz.Timeframe["1m"])
        candles = batchCandles(
          dateFrom,
          dateTo.toISOString(),
          timeframe,
          candles
        );

      return candles;
    },

    /**
     * Load trades
     *
     * @param {cpz.TradesFetchParams} {
     *       exchange,
     *       asset,
     *       currency,
     *       dateFrom
     *     }
     * @returns {Promise<cpz.ExchangeTrade[]>}
     */
    async getTrades({
      exchange,
      asset,
      currency,
      dateFrom
    }: cpz.TradesFetchParams): Promise<cpz.ExchangeTrade[]> {
      try {
        await this.initConnector(exchange);
        const since = dayjs.utc(dateFrom).valueOf();
        const params =
          exchange === "kraken"
            ? {
                since: since * 1000000
              }
            : null;
        const call = async (bail: (e: Error) => void) => {
          try {
            return await this.publicConnectors[exchange].fetchTrades(
              this.getSymbol(asset, currency),
              since,
              2000,
              params
            );
          } catch (e) {
            if (e instanceof ccxt.NetworkError) throw e;
            bail(e);
          }
        };
        const response: ccxt.Trade[] = await retry(call, this.retryOptions);

        if (!response || !Array.isArray(response))
          throw new Errors.MoleculerRetryableError("Failed to fetch trades");

        if (response.length === 0) return [];

        const trades = response.map(trade => {
          const time = dayjs.utc(trade.datetime);
          return {
            exchange,
            asset,
            currency,
            time: time.valueOf(),
            timestamp: time.toISOString(),
            side: trade.side,
            price: trade.price,
            amount: trade.amount
          };
        });

        return trades;
      } catch (e) {
        this.logger.error("Failed to load trades", e.message);
        throw new Errors.MoleculerRetryableError(
          `Failed to load trades. ${e.message}`
        );
      }
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    this._fetch = createFetchMethod(process.env.PROXY_ENDPOINT_PUBLIC);
    this.publicConnectors = {};
    this.retryOptions = {
      retries: 100,
      minTimeout: 0,
      maxTimeout: 0
    };
  },

  /**
   * Service started lifecycle event handler
   */
  async started() {}

  /**
   * Service stopped lifecycle event handler
   */
  // stopped() {

  // },
};

export = PublicConnectorService;

import { Service, ServiceBroker, Errors, Context } from "moleculer";
import ccxt, { Exchange } from "ccxt";
import Auth from "../../mixins/auth";
import retry from "async-retry";
import { cpz } from "../../@types";
import dayjs from "../../lib/dayjs";
import {
  createFetchMethod,
  getCurrentCandleParams,
  getCandlesParams,
  handleCandleGaps,
  batchCandles,
  round
} from "../../utils";
import Timeframe from "../../utils/timeframe";

/**
 * Public Exchange Connector Service
 *
 * @class PublicConnectorService
 * @extends {Service}
 */
class PublicConnectorService extends Service {
  /**
   *Creates an instance of PublicConnectorService.
   * @param {ServiceBroker} broker
   * @memberof PublicConnectorService
   */
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.PUBLIC_CONNECTOR,
      mixins: [Auth],
      /**
       * Actions
       */
      actions: {
        getMarket: {
          params: {
            exchange: "string",
            asset: "string",
            currency: "string"
          },
          graphql: {
            query:
              "getMarket(exchange: String!, asset: String!, currency: String!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          retryPolicy: {
            retries: 20,
            delay: 100,
            maxDelay: 100,
            factor: 1,
            check: (err: Errors.MoleculerRetryableError) =>
              err && !!err.retryable
          },
          async handler(
            ctx: Context<{ exchange: string; asset: string; currency: string }>
          ) {
            try {
              this.authAction(ctx);
              const result = await this.getMarket(
                ctx.params.exchange,
                ctx.params.asset,
                ctx.params.currency
              );
              return { success: true, result };
            } catch (e) {
              this.logger.warn(e);
              return { success: false, error: e.message };
            }
          }
        },
        getTimeframes: {
          params: {
            exchange: { type: "string" }
          },
          retryPolicy: {
            retries: 20,
            delay: 100,
            maxDelay: 100,
            factor: 1,
            check: (err: Errors.MoleculerRetryableError) =>
              err && !!err.retryable
          },
          async handler(ctx: Context<{ exchange: string }>) {
            return this.getTimeframes(ctx.params.exchange);
          }
        },
        getCurrentPrice: {
          params: {
            exchange: "string",
            asset: "string",
            currency: "string"
          },
          retryPolicy: {
            retries: 20,
            delay: 100,
            maxDelay: 100,
            factor: 1,
            check: (err: Errors.MoleculerRetryableError) =>
              err && !!err.retryable
          },
          async handler(
            ctx: Context<{
              exchange: string;
              asset: string;
              currency: string;
            }>
          ): Promise<cpz.ExchangePrice> {
            return this.getCurrentPrice(
              ctx.params.exchange,
              ctx.params.asset,
              ctx.params.currency
            );
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
          retryPolicy: {
            retries: 20,
            delay: 100,
            maxDelay: 100,
            factor: 1,
            check: (err: Errors.MoleculerRetryableError) =>
              err && !!err.retryable
          },
          async handler(
            ctx: Context<{
              exchange: string;
              asset: string;
              currency: string;
              timeframe: cpz.Timeframe;
            }>
          ): Promise<cpz.ExchangeCandle> {
            return this.getCurrentCandle(
              ctx.params.exchange,
              ctx.params.asset,
              ctx.params.currency,
              ctx.params.timeframe
            );
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
            limit: { type: "number", optional: true }
          },
          retryPolicy: {
            retries: 20,
            delay: 100,
            maxDelay: 100,
            factor: 1,
            check: (err: Errors.MoleculerRetryableError) =>
              err && !!err.retryable
          },
          async handler(
            ctx: Context<{
              exchange: string;
              asset: string;
              currency: string;
              timeframe: cpz.Timeframe;
              dateFrom: string;
              limit?: number;
            }>
          ): Promise<cpz.ExchangeCandle[]> {
            return this.getCandles(
              ctx.params.exchange,
              ctx.params.asset,
              ctx.params.currency,
              ctx.params.timeframe,
              ctx.params.dateFrom,
              ctx.params.limit
            );
          }
        },
        getRawCandles: {
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
          retryPolicy: {
            retries: 20,
            delay: 100,
            maxDelay: 100,
            factor: 1,
            check: (err: Errors.MoleculerRetryableError) =>
              err && !!err.retryable
          },
          async handler(
            ctx: Context<{
              exchange: string;
              asset: string;
              currency: string;
              timeframe: cpz.Timeframe;
              dateFrom: string;
              limit?: number;
            }>
          ): Promise<cpz.ExchangeCandle[]> {
            return this.getRawCandles(
              ctx.params.exchange,
              ctx.params.asset,
              ctx.params.currency,
              ctx.params.timeframe,
              ctx.params.dateFrom,
              ctx.params.limit
            );
          }
        },
        getTrades: {
          params: {
            exchange: "string",
            asset: "string",
            currency: "string",
            dateFrom: "string"
          },
          retryPolicy: {
            retries: 20,
            delay: 100,
            maxDelay: 100,
            factor: 1,
            check: (err: Errors.MoleculerRetryableError) =>
              err && !!err.retryable
          },
          async handler(
            ctx: Context<{
              exchange: string;
              asset: string;
              currency: string;
              timeframe: cpz.Timeframe;
              dateFrom: string;
            }>
          ): Promise<cpz.ExchangeTrade[]> {
            return await this.getTrades(
              ctx.params.exchange,
              ctx.params.asset,
              ctx.params.currency,
              ctx.params.dateFrom
            );
          }
        }
      }
    });
  }

  /**
   * List of ccxt instances
   *
   * @type {{ [key: string]: Exchange }}
   * @memberof PublicConnectorService
   */
  connectors: { [key: string]: Exchange } = {};

  /**
   * Retry exchange requests options
   *
   * @memberof PublicConnectorService
   */
  retryOptions = {
    retries: 1000,
    minTimeout: 0,
    maxTimeout: 0,
    onRetry: (err: any, i: number) => {
      if (err) {
        this.logger.warn(`Retry ${i} - ${err.message}`);
      }
    }
  };

  /**
   * Custom fetch method with proxy agent
   *
   * @memberof PublicConnectorService
   */
  _fetch = createFetchMethod(process.env.PROXY_ENDPOINT);

  /**
   * Initialize public CCXT instance
   *
   * @param {string} exchange
   * @returns {Promise<void>}
   * @memberof PublicConnectorService
   */
  async initConnector(exchange: string): Promise<void> {
    if (!(exchange in this.connectors)) {
      const config: { [key: string]: any } = {
        fetchImplementation: this._fetch
      };
      if (exchange === "bitfinex" || exchange === "kraken") {
        this.connectors[exchange] = new ccxt[exchange](config);
      } else if (exchange === "binance_futures") {
        config.options = { defaultType: "future" };
        this.connectors[exchange] = new ccxt.binance(config);
      } else if (exchange === "binance_spot") {
        this.connectors[exchange] = new ccxt.binance(config);
      } else throw new Error("Unsupported exchange");

      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[exchange].loadMarkets();
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      await retry(call, this.retryOptions);
    }
  }

  /**
   * Format currency pair symbol
   *
   * @param {string} asset
   * @param {string} currency
   * @returns {string}
   * @memberof PublicConnectorService
   */
  getSymbol(asset: string, currency: string): string {
    return `${asset}/${currency}`;
  }

  /**
   * Get currency market properties
   *
   * @param {string} exchange
   * @param {string} asset
   * @param {string} currency
   * @returns
   * @memberof PublicConnectorService
   */
  async getMarket(
    exchange: string,
    asset: string,
    currency: string
  ): Promise<cpz.Market> {
    try {
      await this.initConnector(exchange);
      const response: ccxt.Market = await this.connectors[exchange].market(
        this.getSymbol(asset, currency)
      );
      let loadFrom;
      if (exchange === "kraken") {
        const [firstTrade] = await this.getTrades(
          exchange,
          asset,
          currency,
          dayjs.utc("01.01.2013").toISOString()
        );
        if (firstTrade)
          loadFrom = dayjs
            .utc(firstTrade.timestamp)
            .add(1, cpz.TimeUnit.day)
            .startOf(cpz.TimeUnit.day)
            .toISOString();
      } else {
        const [firstCandle] = await this.getRawCandles(
          exchange,
          asset,
          currency,
          5,
          dayjs.utc("01.01.2013").toISOString(),
          10
        );
        if (firstCandle)
          loadFrom = dayjs
            .utc(firstCandle.timestamp)
            .add(1, cpz.TimeUnit.day)
            .startOf(cpz.TimeUnit.day)
            .toISOString();
      }
      return {
        exchange,
        asset,
        currency,
        loadFrom,
        limits: response.limits,
        precision: response.precision,
        averageFee: response.taker
      };
    } catch (e) {
      if (e instanceof ccxt.ExchangeNotAvailable)
        throw new Error("ExchangeNotAvailable");
      if (e instanceof ccxt.NetworkError) throw new Error("NetworkError");
      throw e;
    }
  }

  /**
   * Get exchange timeframes
   *
   * @param {string} exchange
   * @returns {Promise<cpz.ExchangeTimeframes>}
   * @memberof PublicConnectorService
   */
  async getTimeframes(exchange: string): Promise<cpz.ExchangeTimeframes> {
    await this.initConnector(exchange);
    const timeframes: cpz.ExchangeTimeframes = {};

    Object.keys(this.connectors[exchange].timeframes).forEach((key) => {
      const timeframe = Timeframe.stringToTimeframe(key);
      if (timeframe) timeframes[key] = timeframe;
    });
    return timeframes;
  }

  /**
   * Get Current Price
   *
   * @param {string} exchange
   * @param {string} asset
   * @param {string} currency
   * @returns {Promise<cpz.ExchangePrice>}
   * @memberof PublicConnectorService
   */
  async getCurrentPrice(
    exchange: string,
    asset: string,
    currency: string
  ): Promise<cpz.ExchangePrice> {
    try {
      await this.initConnector(exchange);
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[exchange].fetchTicker(
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      const response: ccxt.Ticker = await retry(call, this.retryOptions);
      if (!response || !response.timestamp) return null;
      const time = dayjs.utc(response.timestamp);
      return {
        exchange,
        asset,
        currency,
        time: time.valueOf(),
        timestamp: time.toISOString(),
        price: round(response.close, 6)
      };
    } catch (e) {
      if (e instanceof ccxt.ExchangeNotAvailable)
        throw new Error("ExchangeNotAvailable");
      if (e instanceof ccxt.NetworkError) throw new Error("NetworkError");
      throw e;
    }
  }

  /**
   * Get current open candle
   *
   * @param {string} exchange
   * @param {string} asset
   * @param {string} currency
   * @param {cpz.Timeframe} timeframe
   * @returns {Promise<cpz.ExchangeCandle>}
   * @memberof PublicConnectorService
   */
  async getCurrentCandle(
    exchange: string,
    asset: string,
    currency: string,
    timeframe: cpz.Timeframe
  ): Promise<cpz.ExchangeCandle> {
    try {
      await this.initConnector(exchange);
      const params = getCurrentCandleParams(
        this.connectors[exchange].timeframes,
        timeframe
      );
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[exchange].fetchOHLCV(
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
        const { price } = await this.getCurrentPrice(exchange, asset, currency);
        if (!price) return null;
        const time = dayjs.utc(params.time);
        const roundedPrice = round(price, 6);
        return {
          exchange,
          asset,
          currency,
          timeframe,
          time: time.valueOf(),
          timestamp: time.toISOString(),
          open: roundedPrice,
          high: roundedPrice,
          low: roundedPrice,
          close: roundedPrice,
          volume: 0,
          type: cpz.CandleType.previous
        };
      }
      let candles: cpz.ExchangeCandle[] = response.map((candle) => {
        try {
          if (!candle || !Array.isArray(candle))
            throw new Error("Wrong response");
          return {
            exchange,
            asset,
            currency,
            timeframe: params.timeframe,
            time: +candle[0],
            timestamp: dayjs.utc(+candle[0]).toISOString(),
            open: round(+candle[1], 6),
            high: round(+candle[2], 6),
            low: round(+candle[3], 6),
            close: round(+candle[4], 6),
            volume: round(+candle[5] || 0, 6),
            type:
              +candle[5] === 0 ? cpz.CandleType.previous : cpz.CandleType.loaded
          };
        } catch (e) {
          this.logger.error(e, candle);
          throw e;
        }
      });

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
            open: round(+candles[0].open, 6),
            high: round(Math.max(...candles.map((t) => +t.high)), 6),
            low: round(Math.min(...candles.map((t) => +t.low)), 6),
            close: round(+candles[candles.length - 1].close, 6),
            volume: round(
              +candles.map((t) => t.volume).reduce((a, b) => a + b, 0) || 0,
              6
            ),
            type: cpz.CandleType.created
          }
        ];
      }
      return candles[candles.length - 1];
    } catch (e) {
      if (e instanceof ccxt.ExchangeNotAvailable)
        throw new Error("ExchangeNotAvailable");
      if (e instanceof ccxt.NetworkError) throw new Error("NetworkError");
      throw e;
    }
  }

  /**
   * Get raw exchange candles
   *
   * @param {string} exchange
   * @param {string} asset
   * @param {string} currency
   * @param {cpz.Timeframe} timeframe
   * @param {string} dateFrom
   * @param {number} limit
   * @returns {Promise<cpz.ExchangeCandle[]>}
   * @memberof PublicConnectorService
   */
  async getRawCandles(
    exchange: string,
    asset: string,
    currency: string,
    timeframe: cpz.Timeframe,
    dateFrom: string,
    limit: number = 100
  ): Promise<cpz.ExchangeCandle[]> {
    try {
      await this.initConnector(exchange);
      const { str } = Timeframe.get(timeframe);
      let candles: cpz.ExchangeCandle[] = [];

      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[exchange].fetchOHLCV(
            this.getSymbol(asset, currency),
            str,
            dayjs.utc(dateFrom).valueOf(),
            limit
          );
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      const response: ccxt.OHLCV[] = await retry(call, this.retryOptions);
      if (!response || !Array.isArray(response) || response.length === 0)
        return candles;

      candles = response.map((candle) => {
        try {
          if (!candle || !Array.isArray(candle))
            throw new Error("Wrong response");
          return {
            exchange,
            asset,
            currency,
            timeframe: timeframe,
            time: +candle[0],
            timestamp: dayjs.utc(+candle[0]).toISOString(),
            open: round(+candle[1], 6),
            high: round(+candle[2], 6),
            low: round(+candle[3], 6),
            close: round(+candle[4], 6),
            volume: round(+candle[5], 6) || 0,
            type:
              +candle[5] === 0 ? cpz.CandleType.previous : cpz.CandleType.loaded
          };
        } catch (e) {
          this.logger.error(e, candle);
          throw e;
        }
      });

      return candles;
    } catch (e) {
      if (e instanceof ccxt.ExchangeNotAvailable)
        throw new Error("ExchangeNotAvailable");
      if (e instanceof ccxt.NetworkError) throw new Error("NetworkError");
      throw e;
    }
  }

  /**
   * Get candles in timeframes
   *
   * @param {string} exchange
   * @param {string} asset
   * @param {string} currency
   * @param {cpz.Timeframe} timeframe
   * @param {string} dateFrom
   * @param {number} limit
   * @returns {Promise<cpz.ExchangeCandle[]>}
   * @memberof PublicConnectorService
   */
  async getCandles(
    exchange: string,
    asset: string,
    currency: string,
    timeframe: cpz.Timeframe,
    dateFrom: string,
    limit: number = 100
  ): Promise<cpz.ExchangeCandle[]> {
    try {
      await this.initConnector(exchange);
      const params = getCandlesParams(
        this.connectors[exchange].timeframes,
        timeframe,
        dateFrom,
        limit
      );
      const dateTo = dayjs.utc(params.dateTo).toISOString();
      let candles: cpz.ExchangeCandle[] = [];

      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[exchange].fetchOHLCV(
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

      candles = response.map((candle) => {
        try {
          if (!candle || !Array.isArray(candle))
            throw new Error("Wrong response");
          return {
            exchange,
            asset,
            currency,
            timeframe: params.timeframe,
            time: +candle[0],
            timestamp: dayjs.utc(+candle[0]).toISOString(),
            open: round(+candle[1], 6),
            high: round(+candle[2], 6),
            low: round(+candle[3], 6),
            close: round(+candle[4], 6),
            volume: round(+candle[5], 6) || 0,
            type:
              +candle[5] === 0 ? cpz.CandleType.previous : cpz.CandleType.loaded
          };
        } catch (e) {
          this.logger.error(e, candle);
          throw e;
        }
      });

      candles = await handleCandleGaps(dateFrom, dateTo, candles);
      if (params.batch && timeframe > cpz.Timeframe["1m"])
        candles = await batchCandles(dateFrom, dateTo, timeframe, candles);

      return candles;
    } catch (e) {
      if (e instanceof ccxt.ExchangeNotAvailable)
        throw new Error("ExchangeNotAvailable");
      if (e instanceof ccxt.NetworkError) throw new Error("NetworkError");
      throw e;
    }
  }

  /**
   * Get trades
   *
   * @param {string} exchange
   * @param {string} asset
   * @param {string} currency
   * @param {string} dateFrom
   * @returns {Promise<cpz.ExchangeTrade[]>}
   * @memberof PublicConnectorService
   */
  async getTrades(
    exchange: string,
    asset: string,
    currency: string,
    dateFrom: string
  ): Promise<cpz.ExchangeTrade[]> {
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
          // this.logger.info("getTrades", asset, currency, dateFrom);
          return await this.connectors[exchange].fetchTrades(
            this.getSymbol(asset, currency),
            since,
            1000,
            params
          );
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      const response: ccxt.Trade[] = await retry(call, this.retryOptions);
      /* this.logger.info(
        "getTrades response",
        asset,
        currency,
        dateFrom,
        response.length
      );*/
      if (!response || !Array.isArray(response))
        throw new Errors.MoleculerRetryableError("Failed to fetch trades");

      if (response.length === 0) return [];

      const trades = response.map((trade) => {
        try {
          if (!trade || !trade.datetime) throw new Error("Wrong response");
          const time = dayjs.utc(trade.datetime);
          return {
            exchange,
            asset,
            currency,
            time: time.valueOf(),
            timestamp: time.toISOString(),
            side: trade.side,
            price: round(trade.price, 6),
            amount: round(trade.amount, 6)
          };
        } catch (e) {
          this.logger.error(e, trade);
          throw e;
        }
      });

      return trades;
    } catch (e) {
      if (e instanceof ccxt.ExchangeNotAvailable)
        throw new Error("ExchangeNotAvailable");
      if (e instanceof ccxt.NetworkError) throw new Error("NetworkError");
      throw e;
    }
  }
}

export = PublicConnectorService;

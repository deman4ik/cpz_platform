import { Service, ServiceBroker, Errors } from "moleculer";
import ccxt, { Exchange } from "ccxt";
import HttpsProxyAgent from "https-proxy-agent";
import retry from "async-retry";
import { cpz } from "../../types/cpz";
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
 * Available exchanges
 */
type ExchangeName = "kraken" | "bitfinex";

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
              "getMarket(exchange: String!, asset: String!, currency: String!): JSON!"
          },
          async handler(ctx) {
            return this.getMarket(
              ctx.params.exchange,
              ctx.params.asset,
              ctx.params.currency
            );
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
          async handler(ctx): Promise<cpz.ExchangeCandle> {
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
          async handler(ctx): Promise<cpz.ExchangeCandle[]> {
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
          async handler(ctx): Promise<cpz.ExchangeCandle[]> {
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
          async handler(ctx): Promise<cpz.ExchangeTrade[]> {
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
  publicConnectors: { [key: string]: Exchange } = {};

  /**
   * Retry exchange requests options
   *
   * @memberof PublicConnectorService
   */
  retryOptions = {
    retries: 100,
    minTimeout: 0,
    maxTimeout: 100
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
   * @param {ExchangeName} exchange
   * @returns {Promise<void>}
   * @memberof PublicConnectorService
   */
  async initConnector(exchange: ExchangeName): Promise<void> {
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
   * @param {ExchangeName} exchange
   * @param {string} asset
   * @param {string} currency
   * @returns
   * @memberof PublicConnectorService
   */
  async getMarket(exchange: ExchangeName, asset: string, currency: string) {
    await this.initConnector(exchange);
    const response: ccxt.Market = await this.publicConnectors[exchange].market(
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
      if (firstTrade) loadFrom = firstTrade.timestamp;
    } else if (exchange === "bitfinex") {
      const [firstCandle] = await this.getRawCandles(
        exchange,
        asset,
        currency,
        1,
        dayjs.utc("01.01.2013").toISOString(),
        10
      );
      if (firstCandle) loadFrom = firstCandle.timestamp;
    }
    return {
      exchange,
      asset,
      currency,
      loadFrom,
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
  }

  /**
   * Get exchange timeframes
   *
   * @param {ExchangeName} exchange
   * @returns {Promise<cpz.ExchangeTimeframes>}
   * @memberof PublicConnectorService
   */
  async getTimeframes(exchange: ExchangeName): Promise<cpz.ExchangeTimeframes> {
    await this.initConnector(exchange);
    const timeframes: cpz.ExchangeTimeframes = {};

    Object.keys(this.publicConnectors[exchange].timeframes).forEach(key => {
      const timeframe = Timeframe.stringToTimeframe(key);
      if (timeframe) timeframes[key] = timeframe;
    });
    return timeframes;
  }

  /**
   * Get Current Price
   *
   * @param {ExchangeName} exchange
   * @param {string} asset
   * @param {string} currency
   * @returns {Promise<cpz.ExchangePrice>}
   * @memberof PublicConnectorService
   */
  async getCurrentPrice(
    exchange: ExchangeName,
    asset: string,
    currency: string
  ): Promise<cpz.ExchangePrice> {
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
  }

  /**
   * Get current open candle
   *
   * @param {ExchangeName} exchange
   * @param {string} asset
   * @param {string} currency
   * @param {cpz.Timeframe} timeframe
   * @returns {Promise<cpz.ExchangeCandle>}
   * @memberof PublicConnectorService
   */
  async getCurrentCandle(
    exchange: ExchangeName,
    asset: string,
    currency: string,
    timeframe: cpz.Timeframe
  ): Promise<cpz.ExchangeCandle> {
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
    let candles: cpz.ExchangeCandle[] = response.map(candle => {
      try {
        if (!candle[1] || !candle[2] || !candle[3] || !candle[4] || !candle[5])
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
          high: round(Math.max(...candles.map(t => +t.high)), 6),
          low: round(Math.min(...candles.map(t => +t.low)), 6),
          close: round(+candles[candles.length - 1].close, 6),
          volume: round(
            +candles.map(t => t.volume).reduce((a, b) => a + b, 0) || 0,
            6
          ),
          type: cpz.CandleType.created
        }
      ];
    }
    return candles[candles.length - 1];
  }

  /**
   * Get raw exchange candles
   *
   * @param {ExchangeName} exchange
   * @param {string} asset
   * @param {string} currency
   * @param {cpz.Timeframe} timeframe
   * @param {string} dateFrom
   * @param {number} limit
   * @returns {Promise<cpz.ExchangeCandle[]>}
   * @memberof PublicConnectorService
   */
  async getRawCandles(
    exchange: ExchangeName,
    asset: string,
    currency: string,
    timeframe: cpz.Timeframe,
    dateFrom: string,
    limit: number = 100
  ): Promise<cpz.ExchangeCandle[]> {
    await this.initConnector(exchange);
    const { str } = Timeframe.get(timeframe);
    let candles: cpz.ExchangeCandle[] = [];

    const call = async (bail: (e: Error) => void) => {
      try {
        return await this.publicConnectors[exchange].fetchOHLCV(
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

    candles = response.map(candle => {
      try {
        if (!candle[1] || !candle[2] || !candle[3] || !candle[4] || !candle[5])
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
  }

  /**
   * Get candles in timeframes
   *
   * @param {ExchangeName} exchange
   * @param {string} asset
   * @param {string} currency
   * @param {cpz.Timeframe} timeframe
   * @param {string} dateFrom
   * @param {number} limit
   * @returns {Promise<cpz.ExchangeCandle[]>}
   * @memberof PublicConnectorService
   */
  async getCandles(
    exchange: ExchangeName,
    asset: string,
    currency: string,
    timeframe: cpz.Timeframe,
    dateFrom: string,
    limit: number = 100
  ): Promise<cpz.ExchangeCandle[]> {
    await this.initConnector(exchange);
    const params = getCandlesParams(
      this.publicConnectors[exchange].timeframes,
      timeframe,
      dateFrom,
      limit
    );
    const dateTo = dayjs.utc(params.dateTo).toISOString();
    let candles: cpz.ExchangeCandle[] = [];

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

    candles = response.map(candle => {
      try {
        if (!candle[1] || !candle[2] || !candle[3] || !candle[4] || !candle[5])
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
  }

  /**
   * Get trades
   *
   * @param {ExchangeName} exchange
   * @param {string} asset
   * @param {string} currency
   * @param {string} dateFrom
   * @returns {Promise<cpz.ExchangeTrade[]>}
   * @memberof PublicConnectorService
   */
  async getTrades(
    exchange: ExchangeName,
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
          return await this.publicConnectors[exchange].fetchTrades(
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

      if (!response || !Array.isArray(response))
        throw new Errors.MoleculerRetryableError("Failed to fetch trades");

      if (response.length === 0) return [];

      const trades = response.map(trade => {
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
      this.logger.error("Failed to load trades", e.message);
      throw new Errors.MoleculerRetryableError(
        `Failed to load trades. ${e.message}`
      );
    }
  }
}

export = PublicConnectorService;

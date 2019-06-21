import ccxt from "ccxt";
import ServiceError from "cpz/error";
import retry from "async-retry";
import dayjs from "cpz/utils/dayjs";
import Log from "cpz/log";
import BasePublicProvider from "./basePublicProvider";
import { stringToTimeframe, getCurrentCandleParams } from "../utils/helpers";

class CCXTPublicProvider extends BasePublicProvider {
  constructor(input) {
    super(input);
    this._exchangeName = this._exchange.toLowerCase();
    this._retryOptions = {
      retries: 100,
      minTimeout: 0,
      maxTimeout: 0
    };
    this.ccxt = null;
  }

  async init() {
    try {
      this.ccxt = new ccxt[this._exchangeName]({
        fetchImplementation: this._fetch
      });

      const call = async () => {
        await this.ccxt.loadMarkets();
      };
      await retry(call, this._retryOptions);
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_INIT_PUBLIC_PROVIDER_ERROR,
          cause: error,
          info: {
            exchange: this._exchangeName
          }
        },
        "Failed to init public provider."
      );
    }
  }

  getSymbol(asset, currency) {
    return `${asset}/${currency}`;
  }

  getTradesParams(date) {
    if (this._exchangeName === "kraken")
      return {
        since: dayjs.utc(date).valueOf() * 1000000
      };

    return null;
  }

  async getMarket({ asset, currency }) {
    try {
      if (!this.ccxt) {
        await this.init();
      }
      const response = this.ccxt.market(this.getSymbol(asset, currency));
      return {
        success: true,
        market: {
          exchange: this._exchangeName,
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
        }
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: { exchange: this._exchangeName, asset, currency }
        },
        `Failed to get market. ${e.message}`
      );

      Log.error("getMarket", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }

  async getTimeframes() {
    try {
      if (!this.ccxt) {
        await this.init();
      }
      const timeframes = {};

      Object.keys(this.ccxt.timeframes).forEach(key => {
        timeframes[key] = stringToTimeframe(key);
      });
      return {
        success: true,
        timeframes
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: { exchange: this._exchangeName }
        },
        `Failed to get timeframes. ${e.message}`
      );

      Log.error("getTimeframes", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }

  async loadCurrentCandle({ asset, currency, timeframe }) {
    try {
      if (!this.ccxt) {
        await this.init();
      }
      const params = getCurrentCandleParams(this.ccxt.timeframes, timeframe);
      const call = async bail => {
        try {
          return await this.ccxt.fetchOHLCV(
            this.getSymbol(asset, currency),
            params.timeframeStr,
            params.since,
            params.limit
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) bail(e);
          throw e;
        }
      };
      const response = await retry(call, this._retryOptions);
      if (!response || !Array.isArray(response) || response.length === 0)
        throw new ServiceError({
          name: ServiceError.types.CONNECTOR_EMPTY_RESPONSE,
          message: "Empty response.",
          info: {
            exchange: this._exchangeName,
            asset,
            currency,
            timeframe,
            since: params.since,
            limit: params.limit
          }
        });
      let candles = [];

      candles = response.map(candle => ({
        exchange: this._exchangeName,
        asset,
        currency,
        timeframe: params.timeframe,
        time: +candle[0],
        timestamp: dayjs.utc(+candle[0]).toISOString(),
        open: +candle[1],
        high: +candle[2],
        low: +candle[3],
        close: +candle[4],
        volume: +candle[5]
      }));

      if (candles.length > 0 && params.batch) {
        candles = [
          {
            exchange: this._exchangeName,
            asset,
            currency,
            timeframe,
            time: candles[candles.length - 1].time,
            timestamp: candles[candles.length - 1].timestamp,
            open: +candles[0].open,
            high: Math.max(...candles.map(t => +t.high)),
            low: Math.min(...candles.map(t => +t.low)),
            close: +candles[candles.length - 1].close,
            volume: +candles.map(t => t.volume).reduce((a, b) => a + b)
          }
        ];
      }

      return {
        success: true,
        candle: candles[candles.length - 1]
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: { exchange: this._exchangeName, asset, currency, timeframe }
        },
        `Failed to load current candle. ${e.message}`
      );

      Log.error("loadCurrentCandle", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }

  async loadLastMinuteCandle({ date, asset, currency }) {
    try {
      if (!this.ccxt) {
        await this.init();
      }
      let dateStart;
      if (date) {
        dateStart = date;
      } else {
        dateStart = dayjs
          .utc()
          .startOf("minute")
          .add(-1, "minute");
      }
      const call = async bail => {
        try {
          return await this.ccxt.fetchOHLCV(
            this.getSymbol(asset, currency),
            "1m",
            dateStart.valueOf(),
            1
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) bail(e);
          throw e;
        }
      };
      const response = await retry(call, this._retryOptions);
      const latestCandle = response[0];
      return {
        success: true,
        candle: {
          exchange: this._exchangeName,
          asset,
          currency,
          timeframe: 1,
          time: +latestCandle[0],
          timestamp: dayjs.utc(+latestCandle[0]).toISOString(),
          open: +latestCandle[1],
          high: +latestCandle[2],
          low: +latestCandle[3],
          close: +latestCandle[4],
          volume: +latestCandle[5]
        }
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: { exchange: this._exchangeName, asset, currency }
        },
        `Failed to load last minute candle. ${e.message}`
      );

      Log.error("loadLastMinuteCandle", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }

  async loadMinuteCandles({
    date = dayjs
      .utc()
      .add(-1, "hour")
      .startOf("minute"),
    limit = 60,
    asset,
    currency
  }) {
    try {
      if (!this.ccxt) {
        await this.init();
      }
      const dateToLoad =
        dayjs.utc(date).valueOf() <
        dayjs
          .utc()
          .add(-1, "minute")
          .startOf("minute")
          ? date
          : dayjs
              .utc()
              .add(-1, "minute")
              .startOf("minute");
      const call = async bail => {
        try {
          return await this.ccxt.fetchOHLCV(
            this.getSymbol(asset, currency),
            "1m",
            dayjs.utc(dateToLoad).valueOf(),
            limit
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) bail(e);
          throw e;
        }
      };
      const response = await retry(call, this._retryOptions);
      if (!response)
        return {
          success: false,
          error: {
            name: "NetworkError",
            message: "Failed to get response from exchange"
          }
        };
      const candles = response
        .map(candle => ({
          exchange: this._exchangeName,
          asset,
          currency,
          timeframe: 1,
          time: +candle[0],
          timestamp: dayjs.utc(+candle[0]).toISOString(),
          open: +candle[1],
          high: +candle[2],
          low: +candle[3],
          close: +candle[4],
          volume: +candle[5]
        }))
        .filter(
          candle =>
            candle.time <=
            dayjs
              .utc()
              .add(-1, "minute")
              .valueOf()
        );
      return {
        success: true,
        candles
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: {
            exchange: this._exchangeName,
            asset,
            currency,
            date: date.toISOString()
          }
        },
        `Failed to load minute candles. ${e.message}`
      );

      Log.error("loadMinuteCandles", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }

  async loadTrades({
    date = dayjs.utc().add(-1, "hour"),
    limit = 2000,
    asset,
    currency
  }) {
    try {
      if (!this.ccxt) {
        await this.init();
      }
      const dateToLoad =
        dayjs.utc(date).valueOf() < dayjs.utc().add(-1, "minute")
          ? date
          : dayjs.utc().add(-1, "minute");
      const call = async bail => {
        try {
          return await this.ccxt.fetchTrades(
            this.getSymbol(asset, currency),
            null,
            limit,
            this.getTradesParams(dateToLoad)
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) bail(e);
          throw e;
        }
      };
      const response = await retry(call, this._retryOptions);
      if (!response)
        return {
          success: false,
          error: {
            name: "NetworkError",
            message: "Failed to get response from exchange"
          }
        };
      const trades = response.map(trade => ({
        exchange: this._exchangeName,
        asset,
        currency,
        timeframe: 1,
        time: +trade.timestamp,
        timestamp: trade.datetime,
        price: +trade.price,
        amount: +trade.amount
      }));
      return {
        success: true,
        trades
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: {
            exchange: this._exchangeName,
            asset,
            currency,
            date: date.toISOString()
          }
        },
        `Failed to load trades. ${e.message}`
      );

      Log.error("loadTrades", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }
}

export default CCXTPublicProvider;

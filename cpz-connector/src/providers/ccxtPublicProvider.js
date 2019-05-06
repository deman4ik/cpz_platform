import ccxt from "ccxt";
import ServiceError from "cpz/error";
import retry from "async-retry";
import dayjs from "cpz/utils/dayjs";
import Log from "cpz/log";
import BasePublicProvider from "./basePublicProvider";

class CCXTPublicProvider extends BasePublicProvider {
  constructor(input) {
    super(input);
    this._exchangeName = this._exchange.toLowerCase();

    this.ccxt = null;
    this._retryOptions = {
      retries: 100,
      minTimeout: 100,
      onRetry: (err, i) => {
        Log.warn(`CCXTPublicProvider retry ${i} - error: ${err}`);
      }
    };
  }

  async init() {
    try {
      this.ccxt = new ccxt[this._exchangeName]({
        agent: this._proxyAgent
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
    } catch (error) {
      Log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
      };
    }
  }

  async loadLastMinuteCandle({ date, asset, currency }) {
    try {
      Log.debug("loadLastMinuteCandle()");
      if (!this.ccxt) {
        await this.init();
      }
      let dateStart;
      if (date) {
        dateStart = date;
      } else {
        dateStart = dayjs.utc().add(-2, "minute");
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
    } catch (error) {
      Log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
      };
    }
  }

  async loadMinuteCandles({
    date = dayjs.utc().add(-1, "hour"),
    limit = 60,
    asset,
    currency
  }) {
    try {
      Log.debug("loadMinuteCandles()", dayjs.utc(date).toISOString());
      if (!this.ccxt) {
        await this.init();
      }
      const dateToLoad =
        dayjs.utc(date).valueOf() < dayjs.utc().add(-2, "minute")
          ? date
          : dayjs.utc().add(-2, "minute");

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
              .add(-2, "minute")
              .valueOf()
        );
      return {
        success: true,
        candles
      };
    } catch (error) {
      Log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
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
      Log.debug("loadTrades()", dayjs.utc(date).toISOString());
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
    } catch (error) {
      Log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
      };
    }
  }
}

export default CCXTPublicProvider;

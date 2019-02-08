import ccxt from "ccxt";
import VError from "verror";
import pretry from "p-retry";
import dayjs from "cpzDayjs";
import BasePublicProvider from "./basePublicProvider";

class CCXTPublicProvider extends BasePublicProvider {
  constructor(input) {
    super(input);
    this._exchangeName = this._exchange.toLowerCase();

    this.ccxt = {};
    this._retryOptions = {
      retries: 100,
      minTimeout: 100
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
      await pretry(call, this._retryOptions);
    } catch (error) {
      throw new VError(
        {
          name: "InitPublicProviderError",
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

  async getMarket(context, { asset, currency }) {
    try {
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
      context.log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
      };
    }
  }

  async loadLastMinuteCandle(context, { date = dayjs.utc(), asset, currency }) {
    try {
      context.log("loadLastMinuteCandle()");
      const dateStart = dayjs.utc(date).add(-2, "minute");
      const call = async () => {
        try {
          return await this.ccxt.fetchOHLCV(
            this.getSymbol(asset, currency),
            "1m",
            dateStart.valueOf(),
            1
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) throw new pretry.AbortError(e);
          throw e;
        }
      };
      const response = await pretry(call, this._retryOptions);
      const latestCandle = response[0];
      return {
        success: true,
        candle: {
          exchange: this._exchangeName,
          asset,
          currency,
          timeframe: 1,
          time: latestCandle[0],
          timestamp: dayjs.utc(latestCandle[0]).toISOString(),
          open: latestCandle[1],
          high: latestCandle[2],
          low: latestCandle[3],
          close: latestCandle[4],
          volume: latestCandle[5]
        }
      };
    } catch (error) {
      context.log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
      };
    }
  }

  async loadMinuteCandles(
    context,
    { date = dayjs.utc().add(-1, "hour"), limit = 60, asset, currency }
  ) {
    try {
      context.log("loadMinuteCandles()", dayjs.utc(date).toISOString());
      const dateToLoad =
        dayjs.utc(date).valueOf() < dayjs.utc().add(-1, "minute")
          ? date
          : dayjs.utc().add(-1, "minute");

      const call = async () => {
        try {
          return await this.ccxt.fetchOHLCV(
            this.getSymbol(asset, currency),
            "1m",
            dayjs.utc(dateToLoad).valueOf(),
            limit
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) throw new pretry.AbortError(e);
          throw e;
        }
      };
      const response = await pretry(call, this._retryOptions);
      if (!response)
        return {
          success: false,
          error: {
            name: "NetworkError",
            message: "Failed to get response from exchange"
          }
        };
      const candles = response.map(candle => ({
        exchange: this._exchangeName,
        asset,
        currency,
        timeframe: 1,
        time: candle[0],
        timestamp: dayjs(candle[0]).toISOString(),
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5]
      }));
      context.log(candles.length);
      return {
        success: true,
        candles
      };
    } catch (error) {
      context.log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
      };
    }
  }

  async loadTrades(
    context,
    { date = dayjs.utc().add(-1, "hour"), limit = 2000, asset, currency }
  ) {
    try {
      context.log("loadTrades()", dayjs.utc(date).toISOString());
      const dateToLoad =
        dayjs.utc(date).valueOf() < dayjs.utc().add(-1, "minute")
          ? date
          : dayjs.utc().add(-1, "minute");
      const call = async () => {
        try {
          return await this.ccxt.fetchTrades(
            this.getSymbol(asset, currency),
            null,
            limit,
            this.getTradesParams(dateToLoad)
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) throw new pretry.AbortError(e);
          throw e;
        }
      };
      const response = await pretry(call, this._retryOptions);
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
        time: trade.timestamp,
        timestamp: trade.datetime,
        price: trade.price,
        amount: trade.amount
      }));
      context.log(trades.length);
      return {
        success: true,
        trades
      };
    } catch (error) {
      context.log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
      };
    }
  }
}

export default CCXTPublicProvider;

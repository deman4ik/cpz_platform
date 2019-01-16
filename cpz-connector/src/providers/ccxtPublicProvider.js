import ccxt from "ccxt";
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
    this.ccxt = new ccxt[this._exchangeName]({
      agent: this._proxyAgent
    });
  }

  getSymbol(asset, currency) {
    return `${asset}/${currency}`;
  }

  async loadLastMinuteCandle(context, { date = dayjs(), asset, currency }) {
    try {
      context.log("loadLastMinuteCandle()");
      const dateStart = dayjs(date).add(-2, "minute");
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
          timestamp: dayjs(latestCandle[0]).toISOString(),
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
    { date = dayjs().add(-1, "hour"), limit = 60, asset, currency }
  ) {
    try {
      context.log("loadMinuteCandles()", dayjs(date).toISOString());
      const dateToLoad =
        dayjs(date).valueOf() < dayjs().add(-1, "minute")
          ? date
          : dayjs().add(-1, "minute");

      const call = async () => {
        try {
          return await this.ccxt.fetchOHLCV(
            this.getSymbol(asset, currency),
            "1m",
            dayjs(dateToLoad).valueOf(),
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
}

export default CCXTPublicProvider;

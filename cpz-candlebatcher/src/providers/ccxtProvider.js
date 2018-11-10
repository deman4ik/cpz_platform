import dayjs from "cpzDayjs";
import ccxt from "ccxt";
import VError from "verror";
import retry from "cpzUtils/retry";
import { modeToStr, durationMinutes, sortAsc } from "cpzUtils/helpers";
import BaseProvider from "./baseProvider";
import { generateCandleId } from "../utils";

class CCXTProvider extends BaseProvider {
  constructor(input) {
    super(input);
    this._symbol = `${this._asset}/${this._currency}`;
    this._exchangeName = this._exchange.toLowerCase();
    // ? Костыль
    if (this._exchangeName === "bitfinex") {
      this._exchangeName = "bitfinex2";
      if (this._currency === "USD") {
        this._symbol = `${this._asset}/USDT`;
      }
    }
    this._connector = new ccxt[this._exchangeName]({
      agent: this._proxyAgent
    });
  }

  async loadCandles(dateNext) {
    try {
      const dateEnd = dateNext || this._dateTo;
      const minutesLeft = durationMinutes(this._dateFrom, dateEnd, true);
      const limit = minutesLeft > this._limit ? this._limit : minutesLeft;
      const dateStart = dayjs(dateEnd).add(-limit, "minute");

      const response = await retry(async () =>
        this._connector.fetchOHLCV(
          this._symbol,
          "1m",
          dateStart.valueOf(),
          this._limit
        )
      );

      if (response) {
        if (response.length > 0) {
          const filteredData = response
            .filter(
              candle =>
                dayjs(candle[0]).valueOf() >= this._dateStart.valueOf() &&
                dayjs(candle[0]).valueOf() < this._dateEnd.valueOf()
            )
            .sort((a, b) => sortAsc(a[0], b[0]));
          if (filteredData.length > 0) {
            /* Преобразуем объект в массив */
            const data = filteredData.map(item => ({
              id: generateCandleId(
                this._exchange,
                this._asset,
                this._currency,
                1,
                modeToStr(this._mode),
                item[0]
              ),
              importerId: this._importerId,
              exchange: this._exchange,
              asset: this._asset,
              currency: this._currency,
              timeframe: 1,
              mode: this._mode,
              time: item[0],
              timestamp: dayjs(item[0]).toISOString(),
              open: item[1],
              high: item[2],
              low: item[3],
              close: item[4],
              volume: item[5],
              type: "imported"
            }));

            return {
              firstDate: data[0].timestamp,
              lastDate: data[data.length - 1].timestamp,
              data
            };
          }
          return {
            firstDate: dateStart,
            lastDate: dateEnd,
            data: []
          };
        }
      }
      throw new Error("Can't load data");
    } catch (error) {
      throw new VError(
        { name: "LoadCandlesError", cause: error, info: this._currentState },
        "Failed to load candles"
      );
    }
  }

  async loadPreviousCandle(date = dayjs()) {
    try {
      const dateStart = date.add(-2, "minute");
      const response = await retry(async () =>
        this._connector.fetchOHLCV(this._symbol, "1m", dateStart.valueOf(), 1)
      );
      if (response) {
        if (response.length > 0) {
          const latestCandle = response[0];
          return {
            id: generateCandleId(
              this._exchange,
              this._asset,
              this._currency,
              1,
              modeToStr(this._mode),
              latestCandle[0]
            ),
            importerId: this._importerId,
            candlebatcherId: this._candlebatcherId,
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency,
            timeframe: 1,
            mode: this._mode,
            time: latestCandle[0],
            timestamp: dayjs(latestCandle[0]).toISOString(),
            open: latestCandle[1],
            high: latestCandle[2],
            low: latestCandle[3],
            close: latestCandle[4],
            volume: latestCandle[5],
            type: "imported"
          };
        }
      }
      return null;
    } catch (error) {
      throw new VError(
        { name: "LoadPrevCandleError", cause: error, info: this._currentState },
        "Failed to load previous candle"
      );
    }
  }

  get _currentState() {
    return {
      name: "ccxt",
      asset: this._asset,
      currency: this._currency,
      exchange: this._exchange,
      timframe: this._timeframe,
      limit: this._limit,
      dateFrom: this._dateFrom,
      dateTo: this._dateTo,
      dateNext: this._dateNext,
      proxy: this._proxy
    };
  }
}

export default CCXTProvider;

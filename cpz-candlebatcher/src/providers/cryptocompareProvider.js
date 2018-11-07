import dayjs from "dayjs";
import VError from "verror";
import retry from "cpzUtils/retry";
import { fetchJSON } from "cpzUtils/fetch";
import BaseProvider from "./baseProvider";

class CryptocompareProvider extends BaseProvider {
  constructor(input) {
    super(input);
    this._baseUrl = "https://min-api.cryptocompare.com/data/";
  }

  async loadCandles(dateNext) {
    try {
      const options = {
        fsym: this._asset,
        tsym: this._currency,
        exchange: this._exchange,
        timestamp: dayjs(dateNext || this._dateTo).unix(),
        limit: this._limit
      };
      const url = this._histoMinute(options);

      const response = await retry(async () =>
        fetchJSON(url, this._proxyAgent)
      );

      const filteredData = response.Data.filter(
        candle =>
          dayjs(candle.time * 1000).isAfter(this._dateStart) ||
          dayjs(candle.time * 1000).isBefore(this._dateEnd)
      ).sort((a, b) => a.time > b.time);
      /* Преобразуем объект в массив */
      const data = filteredData.map(item => ({
        time: item.time * 1000,
        timestamp: dayjs(item.time * 1000).toISOString(),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volumefrom
      }));
      return {
        firstDate: data[0].timestamp,
        lastDate: data[data.length - 1].timestamp,
        data
      };
    } catch (error) {
      throw new VError(
        { name: "LoadCandlesError", cause: error, info: this._currentState },
        "Failed to load candles"
      );
    }
  }

  async loadPreviousCandle(date = dayjs()) {
    try {
      const options = {
        fsym: this._asset,
        tsym: this._currency,
        exchange: this._exchange,
        timestamp: date.unix(),
        limit: 1
      };

      const url = this._histoMinute(options);

      const response = await retry(async () =>
        fetchJSON(url, this._proxyAgent)
      );
      const latestCandle = response.Data[0];
      return {
        time: latestCandle.time * 1000,
        timestamp: dayjs(latestCandle.time * 1000).toISOString(),
        open: latestCandle.open,
        high: latestCandle.high,
        low: latestCandle.low,
        close: latestCandle.close,
        volume: latestCandle.volumefrom
      };
    } catch (error) {
      throw new VError(
        { name: "LoadPrevCandleError", cause: error, info: this._currentState },
        "Failed to load previous candle"
      );
    }
  }

  get _currentState() {
    return {
      name: "cryptocompare",
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

  _histoDay(options) {
    let url = `${this._baseUrl}histoday?fsym=${options.fsym}&tsym=${
      options.tsym
    }`;
    if (options.exchange) url += `&e=${options.exchange}`;
    if (options.limit === "none") url += "&allData=true";
    else if (options.limit) url += `&limit=${options.limit}`;
    if (options.tryConversion === false) url += "&tryConversion=false";
    if (options.aggregate) url += `&aggregate=${options.aggregate}`;
    if (options.timestamp) url += `&toTs=${options.timestamp}`;
    return url;
  }

  _histoHour(options) {
    let url = `${this._baseUrl}histohour?fsym=${options.fsym}&tsym=${
      options.tsym
    }`;
    if (options.exchange) url += `&e=${options.exchange}`;
    if (options.limit) url += `&limit=${options.limit}`;
    if (options.tryConversion === false) url += "&tryConversion=false";
    if (options.aggregate) url += `&aggregate=${options.aggregate}`;
    if (options.timestamp) url += `&toTs=${options.timestamp}`;
    return url;
  }

  _histoMinute(options) {
    let url = `${this._baseUrl}histominute?fsym=${options.fsym}&tsym=${
      options.tsym
    }`;
    if (options.exchange) url += `&e=${options.exchange}`;
    if (options.limit) url += `&limit=${options.limit}`;
    if (options.tryConversion === false) url += "&tryConversion=false";
    if (options.aggregate) url += `&aggregate=${options.aggregate}`;
    if (options.timestamp) url += `&toTs=${options.timestamp}`;
    return url;
  }
}

export default CryptocompareProvider;

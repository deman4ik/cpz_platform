import VError from "verror";
import dayjs from "dayjs";
import HttpsProxyAgent from "https-proxy-agent";

class BaseProvider {
  constructor(input) {
    this._exchange = input.exchange;
    this._asset = input.asset;
    this._currency = input.currency;
    this._timeframe = input.timframe || 1;
    this._limit = input.limit || 500;
    this._dateFrom = input.dateFrom;
    this._dateTo = input.dateTo;

    this._proxy = input.proxy || process.env.PROXY_ENDPOINT;
    if (this._proxy) this._proxyAgent = new HttpsProxyAgent(this._proxy);
    // Дата начала импорта
    if (this._dateFrom) this._dateStart = dayjs(this._dateFrom);
    // Дата конца импорта
    if (this._dateTo) this._dateEnd = dayjs(this._dateTo);
  }

  loadCandles() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'loadCandles' not impemented in this Provider"
    );
  }

  loadPreviousCandle() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'loadPreviousCandle' not impemented in this Provider"
    );
  }
}

export default BaseProvider;

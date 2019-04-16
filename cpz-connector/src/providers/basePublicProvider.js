import VError from "verror";
import HttpsProxyAgent from "https-proxy-agent";

class BasePublicProvider {
  constructor(input) {
    this._exchange = input.exchange;
    this._proxy = input.proxy || process.env.PROXY_ENDPOINT;
    if (this._proxy) this._proxyAgent = new HttpsProxyAgent(this._proxy);
  }

  async getMarket() {
    throw new VError(
      { name: "NotImplementedError" },
      "Method 'getMarket' not impemented in this Provider"
    );
  }

  async loadPreviousCandle() {
    throw new VError(
      { name: "NotImplementedError" },
      "Method 'loadPreviousCandle' not impemented in this Provider"
    );
  }

  async loadCandles() {
    throw new VError(
      { name: "NotImplementedError" },
      "Method 'loadCandles' not impemented in this Provider"
    );
  }

  async loadTrades() {
    throw new VError(
      { name: "NotImplementedError" },
      "Method 'loadTrades' not impemented in this Provider"
    );
  }
}

export default BasePublicProvider;

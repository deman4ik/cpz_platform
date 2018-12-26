import VError from "verror";
import HttpsProxyAgent from "https-proxy-agent";

class BasePublicProvider {
  constructor(input) {
    this._exchange = input.exchange;
    this._proxy = input.proxy || process.env.PROXY_ENDPOINT;
    if (this._proxy) this._proxyAgent = new HttpsProxyAgent(this._proxy);
  }

  async loadPreviousCandle() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'loadPreviousCandle' not impemented in this Provider"
    );
  }

  async loadCandles() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'loadCandles' not impemented in this Provider"
    );
  }
}

export default BasePublicProvider;

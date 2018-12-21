import VError from "verror";
import HttpsProxyAgent from "https-proxy-agent";

class BasePrivateProvider {
  constructor(input) {
    this._userId = input.userId;
    this._exchange = input.exchange;
    this._proxy = input.proxy || process.env.PROXY_ENDPOINT;
    if (this._proxy) this._proxyAgent = new HttpsProxyAgent(this._proxy);
  }

  async getBalance() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'createOrder' not impemented in this Provider"
    );
  }

  async createOrder() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'createOrder' not impemented in this Provider"
    );
  }

  async checkOrder() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'checkOrder' not impemented in this Provider"
    );
  }

  async cancelOrder() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'cancelOrder' not impemented in this Provider"
    );
  }
}

export default BasePrivateProvider;

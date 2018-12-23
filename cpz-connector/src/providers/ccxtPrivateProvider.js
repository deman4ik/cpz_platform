import ccxt from "ccxt";
import pretry from "p-retry";
import BasePrivateProvider from "./basePrivateProvider";

class CCXTPrivateProvider extends BasePrivateProvider {
  constructor(input) {
    super(input);
    this._symbol = `${this._asset}/${this._currency}`;
    this._exchangeName = this._exchange.toLowerCase();

    this.ccxt = {};
    this._retryOptions = {
      retries: 10,
      minTimeout: 100,
      maxTimeout: 500
    };
  }

  async init() {
    // TODO: Load keys from Azure Key Vault
    this.ccxt = new ccxt[this._exchangeName]({
      agent: this._proxyAgent,
      apiKey: process.env.EXCHANGE_API_KEY,
      secret: process.env.EXCHANGE_SECRET_KEY
    });
  }

  clearOrderCache() {
    // keep last 24 hours of history in cache
    const before = this.ccxt.milliseconds() - 24 * 60 * 60 * 1000;

    // purge all closed and canceled orders "older" or issued "before" that time
    this.ccxt.purgeCachedOrders(before);
  }

  getSymbol(asset, currency) {
    return `${asset}/${currency}`;
  }

  async getBalance() {
    try {
      console.log("getBalance()");
      const call = async () => {
        try {
          return await this.ccxt.fetchBalance();
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) throw new pretry.AbortError(e);
        }
      };
      const response = await pretry(call, this._retryOptions);
      // TODO: filter by coin
      return {
        success: true,
        balance: {
          free: response.free,
          used: response.used,
          total: response.total
        }
      };
    } catch (error) {
      return {
        success: false,
        error: { code: error.constructor.name, message: error.message }
      };
    }
  }

  getOrderParams() {
    if (this._exchange === "kraken") {
      return {
        leverage: 3
      };
    }
    if (this._exchange === "bitfinex") {
      return {
        type: "limit"
      };
    }
    return {};
  }

  async createOrder(order) {
    try {
      /* 
      KRAKEN: leverage: 3
      BITFINEX: type: "limit" */
      // TODO: Params
      console.log("createOrder()");
      const { direction, volume, price, asset, currency, params } = order;
      const orderParams = { ...this.getOrderParams(), ...params };
      this.clearOrderCache();
      const call = async () => {
        try {
          return await this.ccxt.createOrder(
            this.getSymbol(asset, currency),
            "limit",
            direction,
            volume,
            price,
            orderParams
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) throw new pretry.AbortError(e);
        }
      };
      const response = await pretry(call, this._retryOptions);
      return {
        success: true,
        order: {
          exId: response.id,
          exTimestamp: response.datetime,
          status: response.status,
          price: response.price,
          average: response.average,
          amount: response.amount,
          remaining: response.remaining,
          executed: response.filled || response.amount - response.remaining
        }
      };
      /* 
      {
  "data": {
    "createOrder": {
      "success": true,
      "error": null,
      "order": {
        "exId": "OEKMRS-3G2VL-OEUP2B",
        "executed": null
      }
    }
  }
} */
    } catch (error) {
      return {
        success: false,
        error: { code: error.constructor.name, message: error.message }
      };
    }
  }

  async checkOrder({ exId, asset, currency }) {
    try {
      console.log("checkOrder()");
      const call = async () => {
        try {
          return await this.ccxt.fetchOrder(
            exId,
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) throw new pretry.AbortError(e);
        }
      };
      const response = await pretry(call, this._retryOptions);
      return {
        success: true,
        order: {
          exId: response.id,
          exTimestamp: response.datetime,
          status: response.status,
          price: response.price,
          average: response.average,
          amount: response.amount,
          remaining: response.remaining,
          executed: response.filled || response.amount - response.remaining
        }
      };
      /*
      {
  "data": {
    "order": {
      "success": true,
      "error": null,
      "order": {
        "exId": "OEKMRS-3G2VL-OEUP2B",
        "exTimestamp": "2018-12-21T15:18:50.760Z",
        "status": "open",
        "price": 10000,
        "average": 0,
        "amount": 0.002,
        "remaining": 0.002,
        "executed": 0
      }
    }
  }
}
*/
    } catch (error) {
      return {
        success: false,
        error: { code: error.constructor.name, message: error.message }
      };
    }
  }

  async cancelOrder({ exId, asset, currency }) {
    try {
      console.log("cancelOrder()");
      const call = async () => {
        try {
          return await this.ccxt.cancelOrder(
            exId,
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          if (e instanceof ccxt.ExchangeError) throw new pretry.AbortError(e);
        }
      };
      await pretry(call, this._retryOptions);

      /*
      {
  "data": {
    "cancelOrder": {
      "success": true,
      "error": null
    }
  }
}
*/
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: { code: error.constructor.name, message: error.message }
      };
    }
  }
}

export default CCXTPrivateProvider;

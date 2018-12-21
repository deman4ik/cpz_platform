import VError from "verror";
import ccxt from "ccxt";
import { ORDER_STATUS_CANCELED } from "cpzState";
import BasePrivateProvider from "./basePrivateProvider";

// TODO: Retry!!!
class CCXTPrivateProvider extends BasePrivateProvider {
  constructor(input) {
    super(input);
    this._symbol = `${this._asset}/${this._currency}`;
    this._exchangeName = this._exchange.toLowerCase();

    this.ccxt = {};
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
    // ? Костыль
    if (this._exchangeName === "bitfinex") {
      if (this.currency === "USD") {
        return `${asset}/USDT`;
      }
    }
    return `${asset}/${currency}`;
  }

  async getBalance() {
    try {
      console.log("getBalance()");
      const response = await this.ccxt.fetchBalance();
      console.log(response);
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
      console.log(error);
      // TODO: error handling
      return {
        success: false,
        error
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
      console.log("createOrder()");
      const { direction, volume, price, asset, currency, params } = order;
      const orderParams = { ...this.getOrderParams(), ...params };
      this.clearOrderCache();
      const response = await this.ccxt.createOrder(
        this.getSymbol(asset, currency),
        "limit",
        direction,
        volume,
        price,
        orderParams
      );
      console.log(response);
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
      console.log(error);
      // TODO: error handling
      /*
      "AuthenticationError"
"InvalidOrder"
"InsufficientFunds"
"NetworkError"
      */
      return {
        success: false,
        error
      };
    }
  }

  async checkOrder({ exId, asset, currency }) {
    try {
      console.log("checkOrder()");
      const response = await this.ccxt.fetchOrder(
        exId,
        this.getSymbol(asset, currency)
      );
      console.log(response);
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
      console.log(error);
      // TODO: error handling
      /*
      "AuthenticationError"
"OrderNotFound"
"NetworkError"
      */
      return {
        success: false,
        error
      };
    }
  }

  async cancelOrder({ exId, asset, currency }) {
    try {
      console.log("cancelOrder()");
      const response = await this.ccxt.cancelOrder(
        exId,
        this.getSymbol(asset, currency)
      );
      console.log(response);
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
      console.log(error);
      // TODO: error handling
      /*
      "AuthenticationError"
"OrderNotFound"
"NetworkError"
      */
      return {
        success: false,
        error
      };
    }
  }
}

export default CCXTPrivateProvider;

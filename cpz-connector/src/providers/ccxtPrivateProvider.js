import ccxt from "ccxt";
import VError from "verror";
import pretry from "p-retry";
import dayjs from "cpzDayjs";
import { correctWithLimit, precision } from "cpzUtils/helpers";
import BasePrivateProvider from "./basePrivateProvider";

class CCXTPrivateProvider extends BasePrivateProvider {
  constructor(input) {
    super(input);

    this.ccxt = {};
    this._retryOptions = {
      retries: 10,
      minTimeout: 100,
      maxTimeout: 500
    };
  }

  async init(context, keyType = "main") {
    try {
      context.log(JSON.stringify(this._keys));
      if (this._keys[keyType].specified && !this._keys[keyType].loaded)
        await this._loadKeys(context, keyType);

      context.log(JSON.stringify(this._keys));
      this.ccxt = new ccxt[this._exchangeName]({
        agent: this._proxyAgent,
        apiKey: this._keys[keyType].APIKey.value,
        secret: this._keys[keyType].APISecret.value
      });

      this._keys[keyType].active = true;
      if (keyType === "main") {
        this._keys.spare.active = false;
      } else {
        this._keys.main.active = false;
      }

      const call = async () => {
        await this.ccxt.loadMarkets();
      };
      await pretry(call, this._retryOptions);
    } catch (error) {
      throw new VError(
        {
          name: "InitPrivateProviderError",
          cause: error,
          info: {
            exchange: this._exchangeName,
            userId: this._userId
          }
        },
        "Failed to init private provider."
      );
    }
  }

  async _checkKeysVersion(context, keys) {
    if (keys) {
      if (
        keys.main &&
        (keys.main.APIKey.name !== this._keys.main.APIKey.name ||
          keys.main.APIKey.version !== this._keys.main.APIKey.version ||
          keys.main.APISecret.name !== this._keys.main.APISecret.name ||
          keys.main.APISecret.version !== this._keys.main.APISecret.version)
      ) {
        this._setKeys({ main: keys.main });
        await this.init(context, "main");
      }

      if (
        keys.spare &&
        (keys.spare.APIKey.name !== this._keys.spare.APIKey.name ||
          keys.spare.APIKey.version !== this._keys.spare.APIKey.version ||
          keys.spare.APISecret.name !== this._keys.spare.APISecret.name ||
          keys.spare.APISecret.version !== this._keys.spare.APISecret.version)
      )
        this._setKeys({ spare: keys.spare });
    }
  }

  async _handleExchangeError(e) {
    if (e instanceof ccxt.ExchangeError) {
      if (this._keys.main.active && this._keys.spare.specified) {
        await this.init("spare");
        throw e;
      }
      throw new pretry.AbortError(e);
    }
    throw e;
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

  async getBalance(context, keys) {
    try {
      context.log("getBalance()");
      await this._checkKeysVersion(context, keys);
      const call = async () => {
        try {
          return await this.ccxt.fetchBalance();
        } catch (e) {
          await this._handleExchangeError(e);
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
      context.log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
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

  async createOrder(context, keys, order) {
    try {
      /* 
      KRAKEN: leverage: 3
      BITFINEX: type: "limit" */
      // TODO: Params
      context.log("createOrder()");
      await this._checkKeysVersion(context, keys);
      const { direction, volume, price, asset, currency, params } = order;
      const market = this.ccxt.market(this.getSymbol(asset, currency));
      const correctedPrice = correctWithLimit(
        precision(price, market.precision.price),
        market.limits.price.min,
        market.limits.price.max
      );
      const correctedVolume = correctWithLimit(
        precision(volume, market.precision.amount),
        market.limits.amount.min,
        market.limits.amount.max
      );
      const orderParams = { ...this.getOrderParams(), ...params };
      this.clearOrderCache();
      const call = async () => {
        try {
          return await this.ccxt.createOrder(
            this.getSymbol(asset, currency),
            "limit",
            direction,
            correctedVolume,
            correctedPrice,
            orderParams
          );
        } catch (e) {
          await this._handleExchangeError(e);
        }
      };
      const response = await pretry(call, this._retryOptions);
      return {
        success: true,
        order: {
          exId: response.id,
          exTimestamp: response.datetime,
          exLastTrade:
            response.lastTradeTimestamp &&
            dayjs(response.lastTradeTimestamp)
              .utc()
              .toISOString(),
          status: response.status,
          price: response.price,
          average: response.average,
          volume: response.amount,
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
      context.log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
      };
    }
  }

  async checkOrder(context, keys, { exId, asset, currency }) {
    try {
      console.log("checkOrder()");
      await this._checkKeysVersion(context, keys);
      const call = async () => {
        try {
          return await this.ccxt.fetchOrder(
            exId,
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          await this._handleExchangeError(e);
        }
      };
      const response = await pretry(call, this._retryOptions);
      return {
        success: true,
        order: {
          exId: response.id,
          exTimestamp: response.datetime,
          exLastTrade:
            response.lastTradeTimestamp &&
            dayjs(response.lastTradeTimestamp)
              .utc()
              .toISOString(),
          status: response.status,
          price: response.price,
          average: response.average,
          volume: response.amount,
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
        "volume": 0.002,
        "remaining": 0.002,
        "executed": 0
      }
    }
  }
}
*/
    } catch (error) {
      context.log.error(error);
      return {
        success: false,
        error: { name: error.constructor.name, message: error.message }
      };
    }
  }

  async cancelOrder(context, keys, { exId, asset, currency }) {
    try {
      context.log("cancelOrder()");
      await this._checkKeysVersion(context, keys);
      const call = async () => {
        try {
          await this.ccxt.cancelOrder(exId, this.getSymbol(asset, currency));
        } catch (e) {
          await this._handleExchangeError(e);
        }
      };
      let err;
      try {
        await pretry(call, this._retryOptions);
      } catch (error) {
        err = { name: error.constructor.name, message: error.message };
      }

      const checkOrder = await this.checkOrder(context, keys, {
        exId,
        asset,
        currency
      });
      return {
        success: true,
        error: err,
        ...checkOrder
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

export default CCXTPrivateProvider;

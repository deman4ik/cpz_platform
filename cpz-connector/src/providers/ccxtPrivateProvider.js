import ccxt from "ccxt";
import ServiceError from "cpz/error";
import retry from "async-retry";
import dayjs from "cpz/utils/dayjs";
import Log from "cpz/log";
import { ORDER_TYPE_MARKET_FORCE, createOrderSlug } from "cpz/config/state";
import { correctWithLimit, precision } from "cpz/utils/helpers";
import {
  getExchangeOrder,
  saveExchangeOrder
} from "cpz/tableStorage-client/market/orders";
import BasePrivateProvider from "./basePrivateProvider";

class CCXTPrivateProvider extends BasePrivateProvider {
  constructor(input) {
    super(input);

    this.ccxt = null;
    this._retryOptions = {
      retries: 10,
      minTimeout: 0,
      maxTimeout: 0
    };
  }

  async init(keyType = "main") {
    try {
      if (this._keys[keyType].specified && !this._keys[keyType].loaded)
        await this._loadKeys(keyType);

      this.ccxt = new ccxt[this._exchangeName]({
        fetchImplementation: this._fetch,
        apiKey: this._keys[keyType].APIKey.value,
        secret: this._keys[keyType].APISecret.value,
        enableRateLimit: true,
        timeout: 30000
      });

      this._keys[keyType].active = true;
      if (keyType === "main") {
        this._keys.spare.active = false;
      } else {
        this._keys.main.active = false;
      }

      await this.loadMarkets(true);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_INIT_PR_PROVIDER_ERROR,
          cause: e,
          info: {
            exchange: this._exchangeName,
            userId: this._userId,
            critical: true
          }
        },
        "Failed to init private provider."
      );
    }
  }

  async loadMarkets(force = false) {
    if (!this.ccxt.markets || force) {
      const call = async () => {
        await this.ccxt.loadMarkets();
      };
      await retry(call, this._retryOptions);
    }
  }

  async _checkKeysVersion(keys) {
    if (keys) {
      if (
        keys.main &&
        (keys.main.APIKey.name !== this._keys.main.APIKey.name ||
          keys.main.APIKey.version !== this._keys.main.APIKey.version ||
          keys.main.APISecret.name !== this._keys.main.APISecret.name ||
          keys.main.APISecret.version !== this._keys.main.APISecret.version)
      ) {
        this._setKeys({ main: keys.main });
        await this.init("main");
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

  async _handleExchangeError(e, bail) {
    if (e instanceof ccxt.NetworkError) {
      throw e;
    }
    if (e instanceof ccxt.ExchangeError) {
      if (this._keys.main.active && this._keys.spare.specified) {
        await this.init("spare");
        throw e;
      }
      bail(
        new ServiceError(
          {
            name: ServiceError.types.CONNECTOR_EXCHANGE_ERROR,
            cause: e,
            info: {
              critical: true,
              userMessage: e.message
            }
          },
          `Exchange Error. ${e.message}`
        )
      );
    }
    bail(
      new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: {
            critical: true,
            userMessage: e.message
          }
        },
        "Connector Error."
      )
    );
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

  async getBalance(keys) {
    try {
      await this._checkKeysVersion(keys);
      if (!this.ccxt) {
        await this.init();
      }
      const call = async bail => {
        try {
          return await this.ccxt.fetchBalance();
        } catch (e) {
          await this._handleExchangeError(e, bail);
          return null;
        }
      };
      const response = await retry(call, this._retryOptions);
      // TODO: filter by coin
      return {
        success: true,
        balance: {
          free: response.free,
          used: response.used,
          total: response.total
        }
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e
        },
        `Failed to fetch balance. ${e.message}`
      );

      Log.error("getBalance", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }

  getOrderParams(params) {
    const orderParams = params || {};
    if (this._exchange === "kraken") {
      const { defaultLeverage } = orderParams;
      return {
        leverage: defaultLeverage || 2
      };
    }
    if (this._exchange === "bitfinex") {
      return {
        type: "limit"
      };
    }
    return {};
  }

  getCloseOrderDate(orderResponse) {
    if (this._exchange === "kraken") {
      return (
        orderResponse &&
        orderResponse.info &&
        orderResponse.info.closetm &&
        dayjs.utc(parseInt(orderResponse.info.closetm, 10) * 1000).toISOString()
      );
    }

    return (
      orderResponse &&
      orderResponse.lastTradeTimestamp &&
      dayjs.utc(orderResponse.lastTradeTimestamp).toISOString()
    );
  }

  async createOrder(keys, order) {
    try {
      Log.debug("createOrder", order);
      /* 
      KRAKEN: leverage: 3
      BITFINEX: type: "limit" */
      // TODO: Params
      await this._checkKeysVersion(keys);
      const {
        orderId,
        direction,
        volume,
        price,
        asset,
        currency,
        orderType,
        params
      } = order;
      // TODO: 'подмена' ордера - проверить что предудущий ордер действительно отменен и только после этого выставлять новый

      if (!this.ccxt) {
        await this.init();
      }

      await this.loadMarkets();

      let newOrder;
      const existedOrder = await getExchangeOrder({
        PartitionKey: createOrderSlug({
          exchange: this._exchangeName,
          asset,
          currency
        }),
        RowKey: orderId
      });

      if (!existedOrder) {
        /* Если тип ордера строго "маркет" и биржа поддерживает маркет ордера, 
        то выставляем маркет ордер во всех остальных случаях limit */
        const type =
          orderType === ORDER_TYPE_MARKET_FORCE &&
          this.ccxt.has.createMarketOrder
            ? "market"
            : "limit";
        const symbol = this.getSymbol(asset, currency);
        const market = this.ccxt.market(symbol);

        let correctedPrice = price;
        if (!correctedPrice || correctedPrice <= 0) {
          const { close } = await this.ccxt.fetchTicker(
            this.getSymbol(asset, currency)
          );

          correctedPrice = close;
        }

        correctedPrice = correctWithLimit(
          precision(correctedPrice, market.precision.price),
          market.limits.price.min,
          market.limits.price.max
        );

        const correctedVolume = correctWithLimit(
          precision(volume, market.precision.amount),
          market.limits.amount.min,
          market.limits.amount.max
        );
        const orderParams = this.getOrderParams(params);
        this.clearOrderCache();
        Log.debug("createOrder params", {
          ...order,
          correctedVolume,
          correctedPrice,
          orderParams
        });
        const call = async bail => {
          try {
            return await this.ccxt.createOrder(
              this.getSymbol(asset, currency),
              type,
              direction,
              correctedVolume,
              correctedPrice,
              orderParams
            );
          } catch (e) {
            Log.error("createOrder Call Error", e);
            await this._handleExchangeError(e, bail);
            return null;
          }
        };
        const response = await retry(call, this._retryOptions);
        const {
          id: exId,
          datetime,
          status,
          price: orderPrice,
          average,
          amount,
          remaining,
          filled
        } = response;
        newOrder = {
          orderId,
          exId,
          exTimestamp: datetime,
          exLastTrade: this.getCloseOrderDate(response),
          status,
          price: (orderPrice && +orderPrice) || price,
          average: average && +average,
          volume: amount && +amount,
          remaining: remaining && +remaining,
          executed:
            (filled && +filled) ||
            (amount && remaining && +amount - +remaining),
          exchange: this._exchangeName,
          asset,
          currency
        };
        await saveExchangeOrder({
          PartitionKey: createOrderSlug({
            exchange: this._exchangeName,
            asset,
            currency
          }),
          RowKey: orderId,
          exId
        });
      } else {
        newOrder = {
          orderId,
          exId: existedOrder.exId,
          exTimestamp: null,
          exLastTrade: null,
          status: null,
          price: null,
          average: null,
          volume: null,
          remaining: null,
          executed: null,
          exchange: this._exchangeName,
          asset,
          currency
        };
      }
      try {
        const { order: checkedOrder } = await this.checkOrder(keys, {
          exId: newOrder.exId,
          asset,
          currency
        });
        newOrder = { ...newOrder, ...checkedOrder };
      } catch (error) {
        Log.error(
          `Failed to check order after creating. ${
            error.message
          } Order input: ${JSON.stringify(
            order
          )} Order response: ${JSON.stringify(newOrder)}`
        );
      }
      Log.debug("createOrder Result", newOrder);
      return {
        success: true,
        order: newOrder
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: { order }
        },
        `Failed to create new order. ${e.message}`
      );

      Log.error("createOrder", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }

  async checkOrder(keys, { exId, asset, currency }) {
    try {
      await this._checkKeysVersion(keys);
      if (!this.ccxt) {
        await this.init();
      }
      await this.loadMarkets();
      const call = async bail => {
        try {
          return await this.ccxt.fetchOrder(
            exId,
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          await this._handleExchangeError(e, bail);
          return null;
        }
      };
      const response = await retry(call, this._retryOptions);
      const {
        id,
        datetime,
        status,
        price,
        average,
        amount,
        remaining,
        filled
      } = response;
      return {
        success: true,
        order: {
          exId: id,
          exTimestamp: datetime,
          exLastTrade: this.getCloseOrderDate(response),
          status,
          price: price && +price,
          average: average && +average,
          volume: amount && +amount,
          remaining: remaining && +remaining,
          executed:
            (filled && +filled) ||
            (amount && remaining && +amount - +remaining),
          exchange: this._exchangeName,
          asset,
          currency
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
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: {
            exId,
            asset,
            currency,
            exchange: this._exchangeName
          }
        },
        `Failed to check order. ${e.message}`
      );

      Log.error("checkOrder", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }

  async cancelOrder(keys, { exId, asset, currency }) {
    try {
      await this._checkKeysVersion(keys);
      if (!this.ccxt) {
        await this.init();
      }
      await this.loadMarkets();
      const call = async bail => {
        try {
          await this.ccxt.cancelOrder(exId, this.getSymbol(asset, currency));
        } catch (e) {
          await this._handleExchangeError(e, bail);
        }
      };
      let err;
      try {
        await retry(call, this._retryOptions);
      } catch (error) {
        err = { name: error.constructor.name, message: error.message };
      }

      const checkOrder = await this.checkOrder(keys, {
        exId,
        asset,
        currency
      });
      return {
        success: true,
        error: err,
        ...checkOrder
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_ERROR,
          cause: e,
          info: {
            exId,
            asset,
            currency,
            exchange: this._exchangeName
          }
        },
        `Failed to cancel order. ${e.message}`
      );

      Log.error("cancelOrder", error.json);
      return {
        success: false,
        error: error.json
      };
    }
  }
}

export default CCXTPrivateProvider;

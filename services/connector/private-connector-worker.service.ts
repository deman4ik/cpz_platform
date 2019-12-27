import Moleculer, { Service, ServiceBroker, Errors, Context } from "moleculer";
import ccxt, { Exchange, Order } from "ccxt";
import QueueService from "moleculer-bull";
import { Job } from "bull";
import retry from "async-retry";
import { cpz, GenericObject } from "../../@types";
import dayjs from "../../lib/dayjs";
import { createFetchMethod, decrypt } from "../../utils";
import { ORDER_CHECK_TIMEOUT } from "../../config";
/**
 * Available exchanges
 */
type ExchangeName = "kraken" | "bitfinex";

/**
 * Private Exchange Connector Worker Service
 *
 * @class PrivateConnectorWorkerService
 * @extends {Service}
 */
class PrivateConnectorWorkerService extends Service {
  /**
   *Creates an instance of PrivateConnectorWorkerService.
   * @param {ServiceBroker} broker
   * @memberof PrivateConnectorWorkerService
   */
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.PRIVATE_CONNECTOR_WORKER,
      dependencies: [
        cpz.Service.DB_CONNECTOR_JOBS,
        cpz.Service.DB_USER_ORDERS,
        cpz.Service.DB_USER_EXCHANGE_ACCS,
        cpz.Service.PUBLIC_CONNECTOR
      ],
      mixins: [
        QueueService({
          redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS
          },
          settings: {
            lockDuration: 20000,
            lockRenewTime: 5000,
            stalledInterval: 30000,
            maxStalledCount: 10
          }
        })
      ],
      queues: {
        [cpz.Queue.connector]: {
          concurrency: 100,
          async process(job: Job) {
            await this.processJobs(job.id);
            return { success: true, id: job.id };
          }
        }
      },
      /**
       * Actions
       */
      actions: {
        checkAPIKeys: {
          params: {
            exchange: "string",
            key: "string",
            secret: "string",
            pass: { type: "string", optional: true }
          },
          handler: this.checkAPIKeys
        }
      }
    });
  }

  /**
   * List of ccxt instances
   *
   * @type {{ [key: string]: Exchange }}
   * @memberof PrivateConnectorService
   */
  connectors: { [key: string]: Exchange } = {};

  /**
   * Retry exchange requests options
   *
   * @memberof PrivateConnectorWorkerService
   */
  retryOptions = {
    retries: 100,
    minTimeout: 0,
    maxTimeout: 100
  };

  /**
   * Custom fetch method with proxy agent
   *
   * @memberof PrivateConnectorWorkerService
   */
  _fetch = createFetchMethod(process.env.PROXY_ENDPOINT);

  /**
   * Format currency pair symbol
   *
   * @param {string} asset
   * @param {string} currency
   * @returns {string}
   * @memberof PrivateConnectorWorkerService
   */
  getSymbol(asset: string, currency: string): string {
    return `${asset}/${currency}`;
  }

  getOrderParams(
    exchange: ExchangeName,
    params: GenericObject<any>,
    type: cpz.OrderType
  ) {
    if (exchange === "kraken") {
      const { kraken } = params;
      return {
        leverage: (kraken && kraken.leverage) || 3
      };
    }
    if (exchange === "bitfinex") {
      if (type === cpz.OrderType.market)
        return {
          type
        };
      return {
        type: "limit"
      };
    }
    return {};
  }

  getCloseOrderDate(exchange: ExchangeName, orderResponse: Order) {
    if (exchange === "kraken") {
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

  async checkAPIKeys(
    ctx: Context<{
      exchange: ExchangeName;
      key: string;
      secret: string;
      pass?: string;
    }>
  ) {
    try {
      const { exchange, key, secret, pass } = ctx.params;
      const connector = new ccxt[exchange]({
        apiKey: key,
        secret,
        password: pass,
        fetchImplementation: this._fetch
      });
      const call = async (bail: (e: Error) => void) => {
        try {
          return await connector.fetchBalance();
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      const response = await retry(call, this.retryOptions);
      if (response && response.info) return true;
      else
        throw new Errors.MoleculerError(
          "Wrong response from exchange",
          520,
          "ERR_WRONG_RESPONSE",
          response
        );
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async processJobs(userExAccId: string) {
    try {
      this.logger.info(`Connector #${userExAccId} started processing jobs`);
      let [nextJob]: cpz.ConnectorJob[] = await this.broker.call(
        `${cpz.Service.DB_CONNECTOR_JOBS}.find`,
        {
          limit: 1,
          sort: "created_at",
          query: {
            userExAccId
          }
        }
      );
      if (nextJob) {
        const exchangeAcc: cpz.UserExchangeAccount = await this.broker.call(
          `${cpz.Service.DB_USER_EXCHANGE_ACCS}.get`,
          { id: userExAccId }
        );
        if (!exchangeAcc)
          throw new Errors.MoleculerError(
            "Failed to get user exchange account",
            404,
            "ERR_NOT_FOUND",
            { userExAccId }
          );
        if (exchangeAcc.status !== cpz.UserExchangeAccStatus.enabled)
          throw new Errors.MoleculerError(
            "User Excahnge Account is not enabled",
            500,
            "ERR_INVALID_STATUS",
            { userExAccId }
          );
        await this.initConnector(exchangeAcc);

        while (nextJob) {
          await this.run(exchangeAcc, nextJob);
          await this.broker.call(`${cpz.Service.DB_CONNECTOR_JOBS}.remove`, {
            id: nextJob.id
          });
          [nextJob] = await this.broker.call(
            `${cpz.Service.DB_CONNECTOR_JOBS}.find`,
            {
              limit: 1,
              sort: "created_at",
              query: {
                userExAccId
              }
            }
          );
        }
        await this.broker.call(`${cpz.Service.DB_USER_EXCHANGE_ACCS}.update`, {
          id: userExAccId,
          ordersCache: this.connectors[userExAccId].orders
        });
        delete this.connectors[userExAccId];
      }

      this.logger.info(`Connector #${userExAccId} finished processing jobs`);
    } catch (e) {
      if (
        e instanceof ccxt.AuthenticationError ||
        e instanceof ccxt.InsufficientFunds
      ) {
        await this.broker.call(
          `${cpz.Service.DB_USER_EXCHANGE_ACCS}.invalidate`,
          {
            id: userExAccId,
            error: e
          }
        );
      }
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * Initialize CCXT instance
   *
   * @param {cpz.UserExchangeAccount} {id, userId, exchange, keys}
   * @returns {Promise<void>}
   * @memberof PrivateConnectorWorkerService
   */
  async initConnector({
    id,
    userId,
    exchange,
    keys,
    ordersCache
  }: cpz.UserExchangeAccount): Promise<void> {
    if (!(id in this.connectors)) {
      const {
        key: encryptedKey,
        secret: encryptedSecret,
        pass: encryptedPass
      } = keys;

      const apiKey = await decrypt(userId, encryptedKey);
      const secret = await decrypt(userId, encryptedSecret);
      const password = encryptedPass && (await decrypt(userId, encryptedPass));
      this.connectors[id] = new ccxt[<ExchangeName>exchange]({
        apiKey,
        secret,
        password,
        orders: ordersCache,
        enableRateLimit: true,
        fetchImplementation: this._fetch,
        nonce() {
          return this.milliseconds();
        }
      });
    }
  }

  async getNextOrder(userExAccId: string) {
    try {
      const [order] = await this.broker.call(
        `${cpz.Service.DB_USER_ORDERS}.find`,
        {
          limit: 1,
          sort: "last_checked_at next_job_at",
          query: {
            userExAccId,
            nextJob: { $ne: null },
            nextJobAt: { $lte: dayjs.utc().toISOString() }
          }
        }
      );
      return order;
    } catch (err) {
      throw err;
    }
  }

  async run(exAcc: cpz.UserExchangeAccount, job: cpz.ConnectorJob) {
    const { exchange } = exAcc;
    const { userExAccId, type, data } = job;
    try {
      if (type === cpz.ConnectorJobType.order) {
        let order = await this.getNextOrder(userExAccId);

        if (order) {
          while (order) {
            if (order.exchange !== exchange)
              throw new Errors.MoleculerError(
                "Wrong exchange",
                400,
                "ERR_INVALID_PARAMS",
                { exAcc, job, order }
              );

            try {
              order = await this.processOrder(order);

              try {
                await this.broker.call(
                  `${cpz.Service.DB_USER_ORDERS}.update`,
                  order
                );
              } catch (e) {
                this.logger.error("ORDERS UPDATE ERROR", order, e);
                throw e;
              }
              if (
                order.status === cpz.OrderStatus.closed ||
                order.status === cpz.OrderStatus.canceled
              )
                await this.broker.emit(cpz.Event.ORDER_STATUS, order);
              this.logger.info(
                `UserExAcc #${order.userExAccId} processed order`,
                order
              );
              order = await this.getNextOrder(userExAccId);
            } catch (err) {
              this.logger.error(err);

              const failedOrder = {
                ...order,
                lastCheckedAt: dayjs.utc().toISOString(),
                error: err,
                nextJob: null,
                nextJobAt: null
              };
              await this.broker.call(
                `${cpz.Service.DB_USER_ORDERS}.update`,
                failedOrder
              );
              await this.broker.emit(cpz.Event.ORDER_ERROR, failedOrder);
            }
          }
        }
      }
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async processOrder(order: cpz.Order): Promise<cpz.Order> {
    const {
      nextJob: { type: orderJobType, data: orderJobData }
    } = order;

    if (orderJobType === cpz.OrderJobType.create) {
      this.logger.info(
        `UserExAcc #${order.userExAccId} creating order ${order.positionId}/${order.id}`
      );
      if (order.exId || order.status !== cpz.OrderStatus.new) {
        this.logger.error(
          `Failed to create order #${order.id} - order already processed!`
        );
        order.nextJob = {
          type: cpz.OrderJobType.check
        };
        order.nextJobAt = dayjs.utc().toISOString();
        return order;
      }
      order = await this.createOrder(order);
    } else if (orderJobType === cpz.OrderJobType.recreate) {
      this.logger.info(
        `UserExAcc #${order.userExAccId} recreating order ${order.positionId}/${order.id}`
      );
      const checkedOrder = await this.checkOrder(order);
      if (checkedOrder.status === cpz.OrderStatus.canceled) {
        order = await this.createOrder({
          ...checkedOrder,
          price: orderJobData.prce
        });
      } else {
        order = checkedOrder;
      }
    } else if (orderJobType === cpz.OrderJobType.cancel) {
      this.logger.info(
        `UserExAcc #${order.userExAccId} canceling order ${order.positionId}/${order.id}`
      );
      if (!order.exId) {
        return {
          ...order,
          status: cpz.OrderStatus.canceled,
          nextJob: null,
          nextJobAt: null
        };
      }
      if (
        order.status === cpz.OrderStatus.canceled ||
        order.status === cpz.OrderStatus.closed
      ) {
        return { ...order, nextJob: null, nextJobAt: null };
      }
      order = await this.cancelOrder(order);
    } else if (orderJobType === cpz.OrderJobType.check) {
      this.logger.info(
        `UserExAcc #${order.userExAccId} checking order ${order.positionId}/${order.id}`
      );
      if (!order.exId) {
        this.logger.error(
          `Failed to check order #${order.id} - no exchange id!`
        );
        return {
          ...order,
          error: new Error(`Failed to check order - no exchange id!`)
        };
      }
      if (order.status === cpz.OrderStatus.closed) return order;
      order = await this.checkOrder(order);

      if (
        order.status === cpz.OrderStatus.open &&
        order.exTimestamp &&
        dayjs.utc().diff(dayjs(order.exTimestamp), cpz.TimeUnit.second) >
          order.params.orderTimeout
      ) {
        order = await this.cancelOrder(order);
      }
    } else {
      throw new Errors.MoleculerError(
        "Wrong connector job type",
        400,
        "ERR_INVALID_PARAMS",
        { order }
      );
    }
    return order;
  }

  async createOrder(order: cpz.Order): Promise<cpz.Order> {
    try {
      const { userExAccId, exchange, asset, currency, direction } = order;

      const type =
        order.type === cpz.OrderType.market &&
        this.connectors[userExAccId].has.createMarketOrder
          ? cpz.OrderType.market
          : cpz.OrderType.limit;

      let signalPrice: number;

      if (order.price && order.price > 0) {
        signalPrice = order.price;
      } else if (order.signalPrice && order.signalPrice > 0) {
        signalPrice = order.signalPrice;
      } else {
        const currentPrice: cpz.ExchangePrice = await this.broker.call(
          `${cpz.Service.PUBLIC_CONNECTOR}.getCurrentPrice`,
          {
            exchange,
            asset,
            currency
          }
        );
        signalPrice = currentPrice.price;
      }

      const orderParams = this.getOrderParams(
        <ExchangeName>exchange,
        order.params,
        type
      );

      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[userExAccId].createOrder(
            this.getSymbol(asset, currency),
            type,
            direction,
            order.volume,
            signalPrice,
            orderParams
          );
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      const response: Order = await retry(call, this.retryOptions);
      const {
        id: exId,
        datetime: exTimestamp,
        status,
        price,
        amount: volume,
        remaining,
        filled: executed
      } = response;

      return {
        ...order,
        params: { ...order.params, exchangeParams: orderParams },
        signalPrice,
        exId,
        exTimestamp,
        exLastTradeAt: this.getCloseOrderDate(<ExchangeName>exchange, response),
        status: <cpz.OrderStatus>status,
        price: (price && +price) || signalPrice,
        volume: volume && +volume,
        remaining: remaining && +remaining,
        executed:
          (executed && +executed) ||
          (volume && remaining && +volume - +remaining),
        lastCheckedAt: dayjs.utc().toISOString(),
        nextJob: {
          type: cpz.OrderJobType.check
        },
        nextJobAt: dayjs
          .utc()
          .add(ORDER_CHECK_TIMEOUT, cpz.TimeUnit.second)
          .toISOString(),

        error: null
      };
    } catch (err) {
      this.logger.error(err);
      if (
        err instanceof ccxt.AuthenticationError ||
        err instanceof ccxt.InsufficientFunds
      ) {
        throw err;
      }
      if (err instanceof ccxt.InvalidOrder) {
        return {
          ...order,
          error: err,
          status: cpz.OrderStatus.canceled,
          nextJob: null,
          nextJobAt: null
        };
      }
      if (
        err instanceof ccxt.ExchangeError ||
        err instanceof ccxt.NetworkError
      ) {
        return {
          ...order,
          error: err,
          nextJobAt: dayjs
            .utc()
            .add(ORDER_CHECK_TIMEOUT, cpz.TimeUnit.second)
            .toISOString()
        };
      }
      throw err;
    }
  }

  async checkOrder(order: cpz.Order): Promise<cpz.Order> {
    try {
      const { userExAccId, exId, exchange, asset, currency } = order;
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[userExAccId].fetchOrder(
            exId,
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      const response: Order = await retry(call, this.retryOptions);
      const {
        datetime: exTimestamp,
        status,
        price,
        amount: volume,
        remaining,
        filled: executed
      } = response;
      return {
        ...order,
        exTimestamp,
        exLastTradeAt: this.getCloseOrderDate(<ExchangeName>exchange, response),
        status: <cpz.OrderStatus>status,
        price: (price && +price) || order.signalPrice,
        volume: volume && +volume,
        remaining: remaining && +remaining,
        executed:
          (executed && +executed) ||
          (volume && remaining && +volume - +remaining),
        lastCheckedAt: dayjs.utc().toISOString(),
        nextJob:
          <cpz.OrderStatus>status === cpz.OrderStatus.canceled ||
          <cpz.OrderStatus>status === cpz.OrderStatus.closed
            ? null
            : {
                type: cpz.OrderJobType.check
              },
        nextJobAt:
          <cpz.OrderStatus>status === cpz.OrderStatus.canceled ||
          <cpz.OrderStatus>status === cpz.OrderStatus.closed
            ? null
            : dayjs
                .utc()
                .add(ORDER_CHECK_TIMEOUT, cpz.TimeUnit.second)
                .toISOString(),

        error: null
      };
    } catch (err) {
      this.logger.error(err);
      if (
        err instanceof ccxt.AuthenticationError ||
        err instanceof ccxt.InsufficientFunds
      ) {
        throw err;
      }
      if (err instanceof ccxt.InvalidOrder) {
        throw err;
      }
      if (
        err instanceof ccxt.ExchangeError ||
        err instanceof ccxt.NetworkError
      ) {
        return {
          ...order,
          error: err,
          nextJobAt: dayjs
            .utc()
            .add(ORDER_CHECK_TIMEOUT, cpz.TimeUnit.second)
            .toISOString()
        };
      }
      throw err;
    }
  }

  async cancelOrder(order: cpz.Order): Promise<cpz.Order> {
    try {
      const { userExAccId, exId, asset, currency } = order;
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[userExAccId].cancelOrder(
            exId,
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      await retry(call, this.retryOptions);
      return this.checkOrder(order);
    } catch (err) {
      this.logger.error(err);
      if (
        err instanceof ccxt.AuthenticationError ||
        err instanceof ccxt.InsufficientFunds
      ) {
        throw err;
      }
      if (err instanceof ccxt.InvalidOrder) {
        return this.checkOrder(order);
      }
      if (
        err instanceof ccxt.ExchangeError ||
        err instanceof ccxt.NetworkError
      ) {
        return {
          ...order,
          error: err,
          nextJobAt: dayjs
            .utc()
            .add(ORDER_CHECK_TIMEOUT, cpz.TimeUnit.second)
            .toISOString()
        };
      }
      throw err;
    }
  }
}

export = PrivateConnectorWorkerService;

import Moleculer, { Service, ServiceBroker, Errors, Context } from "moleculer";
import ccxt, { Exchange, Order } from "ccxt";
import QueueService from "moleculer-bull";
import { Job } from "bull";
import retry from "async-retry";
import { cpz, GenericObject } from "../../@types";
import dayjs from "../../lib/dayjs";
import {
  createFetchMethod,
  decrypt,
  valuesString,
  groupBy,
  sortDesc,
  sortAsc
} from "../../utils";
import { ORDER_CHECK_TIMEOUT } from "../../config";
import { v4 as uuid } from "uuid";

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
            port: +process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS && {}
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
          graphql: {
            mutation:
              "checkAPIKeys(exchange: String!, key: String!, secret: String!, pass: String): Response!"
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

  getErrorMessage(error: Error) {
    let message = error.message;
    if (error instanceof ccxt.BaseError) {
      try {
        message = valuesString(
          JSON.parse(message.substring(message.indexOf("{")))
        );
        if (!message) message = error.message;
      } catch (e) {
        message = error.message;
      }
    } else {
      message = error.message;
    }
    return message;
  }

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
    exchange: string,
    params: GenericObject<any>,
    type: cpz.OrderType
  ) {
    if (exchange === "kraken") {
      const { kraken } = params;
      return {
        leverage: (kraken && kraken.leverage) || 3,
        trading_agreement: "agree"
      };
    }
    if (exchange === "bitfinex") {
      if (type === cpz.OrderType.market || type === cpz.OrderType.forceMarket)
        return {
          type: cpz.OrderType.market
        };
      return {
        type: "limit"
      };
    }
    return {};
  }

  getCloseOrderDate(exchange: string, orderResponse: Order) {
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
      exchange: string;
      key: string;
      secret: string;
      pass?: string;
    }>
  ) {
    try {
      const { exchange, key, secret, pass } = ctx.params;
      const config: { [key: string]: any } = {
        apiKey: key,
        secret,
        password: pass,
        fetchImplementation: this._fetch,
        options: {
          enableRateLimit: true
        }
      };
      let connector: ccxt.Exchange;
      if (exchange === "bitfinex" || exchange === "kraken") {
        connector = new ccxt[exchange](config);
      } else if (exchange === "binance_futures") {
        config.options.defaultType = "future";
        config.options.adjustForTimeDifference = true;

        connector = new ccxt.binance(config);
      } else throw new Error("Unsupported exchange");

      const getBalanceCall = async (bail: (e: Error) => void) => {
        try {
          return await connector.fetchBalance();
        } catch (e) {
          if (
            e instanceof ccxt.NetworkError &&
            !(e instanceof ccxt.InvalidNonce)
          )
            throw e;
          bail(e);
        }
      };
      try {
        const balances: ccxt.Balances = await retry(
          getBalanceCall,
          this.retryOptions
        );
        if (!balances && !balances.info)
          throw new Errors.MoleculerError(
            "Wrong response from exchange while checking balance",
            520,
            "ERR_WRONG_RESPONSE",
            balances
          );
      } catch (err) {
        throw Error(`Failed to check balance. ${this.getErrorMessage(err)}`);
      }
      const asset = "BTC";
      const currency = exchange === "binance_futures" ? "USDT" : "USD";
      const [market]: cpz.Market[] = await this.broker.call(
        `${cpz.Service.DB_MARKETS}.find`,
        {
          query: {
            exchange,
            asset,
            currency
          }
        }
      );
      let price = market.limits.price.min;
      if (exchange === "binance_futures") {
        const { price: currentPrice } = await this.broker.call(
          `${cpz.Service.PUBLIC_CONNECTOR}.getCurrentPrice`,
          {
            exchange,
            asset,
            currency
          }
        );
        price = currentPrice - 1500;
      }

      const type = cpz.OrderType.limit;
      const orderParams = this.getOrderParams(<string>exchange, {}, type);

      const createOrderCall = async (bail: (e: Error) => void) => {
        try {
          return await connector.createOrder(
            this.getSymbol(asset, currency),
            type,
            cpz.OrderDirection.buy,
            market.limits.amount.min,
            price,
            orderParams
          );
        } catch (e) {
          if (
            e instanceof ccxt.NetworkError &&
            !(e instanceof ccxt.InvalidNonce)
          )
            throw e;
          bail(e);
        }
      };
      let order: Order;
      try {
        order = await retry(createOrderCall, this.retryOptions);
        //  this.logger.info("Created order", order);
        if (!order)
          throw new Errors.MoleculerError(
            "Wrong response from exchange while creating test order",
            520,
            "ERR_WRONG_RESPONSE",
            order
          );
      } catch (err) {
        this.logger.warn(err);
        throw Error(
          `Failed to create test order. ${this.getErrorMessage(err)}`
        );
      }

      const cancelOrderCall = async (bail: (e: Error) => void) => {
        try {
          return await connector.cancelOrder(
            order.id,
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          if (
            e instanceof ccxt.NetworkError &&
            !(e instanceof ccxt.InvalidNonce)
          )
            throw e;
          bail(e);
        }
      };
      try {
        const canceled = await retry(cancelOrderCall, this.retryOptions);

        //  this.logger.info("Canceled order", canceled);
        if (!canceled)
          throw new Errors.MoleculerError(
            "Wrong response from exchange while canceling test order",
            520,
            "ERR_WRONG_RESPONSE",
            canceled
          );
      } catch (err) {
        this.logger.warn(err);
        throw Error(
          `Failed to cancel test order. ${this.getErrorMessage(
            err
          )} Please cancel ${order.id} order manualy.`
        );
      }
      return { success: true };
    } catch (err) {
      this.logger.warn(err);

      return { success: false, error: this.getErrorMessage(err) };
    }
  }

  async processJobs(userExAccId: string) {
    try {
      this.logger.info(`Connector #${userExAccId} started processing jobs`);
      let nextJobs: cpz.ConnectorJob[] = await this.broker.call(
        `${cpz.Service.DB_CONNECTOR_JOBS}.find`,
        {
          sort: "priority -next_job_at",
          query: {
            userExAccId,
            nextJobAt: { $lte: dayjs.utc().toISOString() }
          }
        }
      );
      if (!nextJobs || !Array.isArray(nextJobs) || nextJobs.length === 0)
        return;

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

      while (nextJobs.length > 0) {
        const groupedJobs: {
          [key: string]: cpz.ConnectorJob[];
        } = groupBy(nextJobs, (job) => job.orderId);

        for (const orderJobs of Object.values(groupedJobs)) {
          const [nextJob] = orderJobs.sort((a, b) =>
            sortDesc(
              dayjs.utc(a.nextJobAt).valueOf(),
              dayjs.utc(b.nextJobAt).valueOf()
            )
          );
          await this.run(exchangeAcc, nextJob);
          for (const { id } of orderJobs) {
            await this.broker.call(`${cpz.Service.DB_CONNECTOR_JOBS}.remove`, {
              id
            });
          }
          nextJobs = await this.broker.call(
            `${cpz.Service.DB_CONNECTOR_JOBS}.find`,
            {
              sort: "priority -next_job_at",
              query: {
                userExAccId,
                nextJobAt: { $lte: dayjs.utc().toISOString() }
              }
            }
          );
        }
      }

      await this.broker.call(`${cpz.Service.DB_USER_EXCHANGE_ACCS}.update`, {
        id: userExAccId,
        ordersCache: this.connectors[userExAccId].orders
      });
      delete this.connectors[userExAccId];

      this.logger.info(`Connector #${userExAccId} finished processing jobs`);
    } catch (e) {
      this.logger.error(e, { userExAccId });
      if (
        e instanceof ccxt.AuthenticationError ||
        e instanceof ccxt.InsufficientFunds ||
        e instanceof ccxt.InvalidNonce
      ) {
        await this.broker.call(
          `${cpz.Service.DB_USER_EXCHANGE_ACCS}.invalidate`,
          {
            id: userExAccId,
            error: this.getErrorMessage(e)
          }
        );
      }

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
      const config: { [key: string]: any } = {
        apiKey,
        secret,
        password,
        orders: ordersCache,
        enableRateLimit: true,
        fetchImplementation: this._fetch,
        nonce() {
          return this.milliseconds();
        }
      };

      if (exchange === "bitfinex" || exchange === "kraken") {
        this.connectors[id] = new ccxt[exchange](config);
      } else if (exchange === "binance_futures") {
        config.options = {
          defaultType: "future",
          adjustForTimeDifference: true,
          recvWindow: 10000000
        };
        this.connectors[id] = new ccxt.binance(config);
      } else if (exchange === "binance_spot") {
        config.options = {
          adjustForTimeDifference: true,
          recvWindow: 10000000
        };
        this.connectors[id] = new ccxt.binance(config);
      } else throw new Error("Unsupported exchange");
    }
  }

  async run(exAcc: cpz.UserExchangeAccount, job: cpz.ConnectorJob) {
    const { exchange } = exAcc;
    const { userExAccId, orderId, type, data } = job;
    try {
      let order: cpz.Order = await this.broker.call(
        `${cpz.Service.DB_USER_ORDERS}.get`,
        {
          id: orderId
        }
      );
      if (order) {
        let nextJob: {
          type: cpz.OrderJobType;
          priority: cpz.Priority;
          nextJobAt: string;
        };
        if (order.exchange !== exchange)
          throw new Errors.MoleculerError(
            "Wrong exchange",
            400,
            "ERR_INVALID_PARAMS",
            { exAcc, job, order }
          );

        try {
          const result = await this.processOrder(order, job);
          order = result.order;
          nextJob = result.nextJob;
        } catch (err) {
          this.logger.error(err);

          order = {
            ...order,
            lastCheckedAt: dayjs.utc().toISOString(),
            error: this.getErrorMessage(err),
            status:
              order.nextJob && order.nextJob.type === cpz.OrderJobType.create
                ? cpz.OrderStatus.canceled
                : order.status,
            nextJob: null
          };

          await this.broker.emit(cpz.Event.ORDER_ERROR, order);
        }
        try {
          await this.broker.call(`${cpz.Service.DB_USER_ORDERS}.update`, order);
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
          `UserExAcc #${order.userExAccId} processed order ${order.id}`,
          order
        );

        if (nextJob) {
          await this.broker.call<Promise<void>, cpz.ConnectorJob>(
            `${cpz.Service.PRIVATE_CONNECTOR_RUNNER}.addJob`,
            { ...nextJob, id: uuid(), userExAccId, orderId }
          );
        }
      }
    } catch (err) {
      this.logger.error(err, job);
      throw err;
    }
  }

  async processOrder(
    order: cpz.Order,
    job: cpz.ConnectorJob
  ): Promise<{
    order: cpz.Order;
    nextJob?: {
      type: cpz.OrderJobType;
      priority: cpz.Priority;
      nextJobAt: string;
    };
  }> {
    try {
      const { type: orderJobType, data: orderJobData } = job;
      let nextJob: {
        type: cpz.OrderJobType;
        priority: cpz.Priority;
        nextJobAt: string;
      };
      if (orderJobType === cpz.OrderJobType.create) {
        this.logger.info(
          `UserExAcc #${order.userExAccId} creating order ${order.positionId}/${order.id}`
        );
        if (order.exId || order.status !== cpz.OrderStatus.new) {
          this.logger.error(
            `Failed to create order #${order.id} - order already processed!`
          );
          ({ order, nextJob } = await this.checkOrder(order));
          return {
            order,
            nextJob
          };
        }

        ({ order, nextJob } = await this.createOrder(order));
      } else if (orderJobType === cpz.OrderJobType.recreate) {
        this.logger.info(
          `UserExAcc #${order.userExAccId} recreating order ${order.positionId}/${order.id}`
        );
        const response = await this.checkOrder(order);
        if (response.order.status === cpz.OrderStatus.canceled) {
          ({ order, nextJob } = await this.createOrder({
            ...response.order,
            price: orderJobData.price
          }));
        } else {
          order = response.order;
          nextJob = response.nextJob;
        }
      } else if (orderJobType === cpz.OrderJobType.cancel) {
        this.logger.info(
          `UserExAcc #${order.userExAccId} canceling order ${order.positionId}/${order.id}`
        );
        if (!order.exId) {
          return {
            order: {
              ...order,
              status: cpz.OrderStatus.canceled,
              nextJob: null
            },
            nextJob: null
          };
        }
        if (
          order.status === cpz.OrderStatus.canceled ||
          order.status === cpz.OrderStatus.closed
        ) {
          return { order: { ...order, nextJob: null }, nextJob: null };
        }
        ({ order, nextJob } = await this.cancelOrder(order));
      } else if (orderJobType === cpz.OrderJobType.check) {
        this.logger.info(
          `UserExAcc #${order.userExAccId} checking order ${order.positionId}/${order.id}`
        );
        if (!order.exId) {
          this.logger.error(
            `Failed to check order #${order.id} - no exchange id!`
          );
          return {
            order: {
              ...order,
              error: new Error(`Failed to check order - no exchange id!`),
              nextJob: null
            },
            nextJob: null
          };
        }
        if (
          order.status === cpz.OrderStatus.closed ||
          order.status === cpz.OrderStatus.canceled
        )
          return { order, nextJob: null };
        ({ order, nextJob } = await this.checkOrder(order));

        if (
          order.status === cpz.OrderStatus.open &&
          order.exTimestamp &&
          dayjs.utc().diff(dayjs.utc(order.exTimestamp), cpz.TimeUnit.second) >
            order.params.orderTimeout
        ) {
          this.logger.info(
            `UserExAcc #${order.userExAccId} canceling order ${order.positionId}/${order.id} by timeout`
          );
          ({ order, nextJob } = await this.cancelOrder(order));
        }
      } else {
        throw new Errors.MoleculerError(
          "Wrong connector job type",
          400,
          "ERR_INVALID_PARAMS",
          { order }
        );
      }
      return { order, nextJob };
    } catch (e) {
      this.logger.error(e, order);
      throw e;
    }
  }

  async createOrder(
    order: cpz.Order
  ): Promise<{
    order: cpz.Order;
    nextJob?: {
      type: cpz.OrderJobType;
      priority: cpz.Priority;
      nextJobAt: string;
    };
  }> {
    const creationDate = dayjs.utc().valueOf();
    try {
      const { userExAccId, exchange, asset, currency, direction } = order;

      const type =
        (order.type === cpz.OrderType.market ||
          order.type === cpz.OrderType.forceMarket) &&
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
        <string>exchange,
        order.params,
        type
      );
      let response: Order;
      try {
        response = await this.connectors[userExAccId].createOrder(
          this.getSymbol(asset, currency),
          type,
          direction,
          order.volume,
          type === cpz.OrderType.market ? undefined : signalPrice,
          orderParams
        );
      } catch (err) {
        this.logger.error(err, order);
        if (
          err instanceof ccxt.AuthenticationError ||
          err instanceof ccxt.InsufficientFunds ||
          err instanceof ccxt.InvalidNonce ||
          err instanceof ccxt.InvalidOrder ||
          err.message.includes("Margin is insufficient") ||
          err.message.includes("EOrder:Insufficient initial margin")
        ) {
          throw err;
        }
        if (
          err instanceof ccxt.ExchangeError ||
          err instanceof ccxt.NetworkError
        ) {
          const existedOrder = await this.checkIfOrderExists(
            order,
            creationDate
          );
          if (existedOrder) response = existedOrder;
          else
            return {
              order: {
                ...order,
                exId: null,
                exTimestamp: null,
                status: cpz.OrderStatus.new,
                error: this.getErrorMessage(err)
              },
              nextJob: {
                type: cpz.OrderJobType.create,
                priority: cpz.Priority.high,
                nextJobAt: dayjs
                  .utc()
                  .add(ORDER_CHECK_TIMEOUT, cpz.TimeUnit.second)
                  .toISOString()
              }
            };
        }
        throw err;
      }
      const {
        id: exId,
        datetime: exTimestamp,
        status: orderStatus,
        price,
        average,
        amount: volume,
        remaining,
        filled,
        fee
      } = response;
      const executed =
        (filled && +filled) || (volume && remaining && +volume - +remaining);
      const status =
        orderStatus === cpz.OrderStatus.canceled && executed && executed > 0
          ? cpz.OrderStatus.closed
          : <cpz.OrderStatus>orderStatus;
      return {
        order: {
          ...order,
          params: { ...order.params, exchangeParams: orderParams },
          signalPrice,
          exId,
          exTimestamp: exTimestamp && dayjs.utc(exTimestamp).toISOString(),
          exLastTradeAt: this.getCloseOrderDate(<string>exchange, response),
          status,
          price: (average && +average) || (price && +price) || signalPrice,
          volume: volume && +volume,
          remaining: remaining && +remaining,
          executed,
          fee: (fee && fee.cost) || 0,
          lastCheckedAt: dayjs.utc().toISOString(),
          nextJob: {
            type: cpz.OrderJobType.check
          },
          error: null
        },
        nextJob: {
          type: cpz.OrderJobType.check,
          priority: cpz.Priority.low,
          nextJobAt: dayjs
            .utc()
            .add(ORDER_CHECK_TIMEOUT, cpz.TimeUnit.second)
            .toISOString()
        }
      };
    } catch (err) {
      this.logger.error(err, order);
      throw err;
    }
  }

  async checkIfOrderExists(order: cpz.Order, creationDate: number) {
    try {
      const {
        userExAccId,
        exchange,
        asset,
        currency,
        direction,
        exId,
        volume,
        type
      } = order;
      if (exId) return null;
      let orders: Order[] = [];
      if (this.connectors[order.userExAccId].has["fetchOrders"]) {
        const call = async (bail: (e: Error) => void) => {
          try {
            return await this.connectors[userExAccId].fetchOrders(
              this.getSymbol(asset, currency),
              creationDate
            );
          } catch (e) {
            if (
              e instanceof ccxt.NetworkError &&
              !(e instanceof ccxt.InvalidNonce)
            )
              throw e;
            bail(e);
          }
        };
        orders = await retry(call, this.retryOptions);
      } else if (
        this.connectors[order.userExAccId].has["fetchOpenOrders"] &&
        this.connectors[order.userExAccId].has["fetchClosedOrders"]
      ) {
        const callOpen = async (bail: (e: Error) => void) => {
          try {
            return await this.connectors[userExAccId].fetchOpenOrders(
              this.getSymbol(asset, currency),
              creationDate
            );
          } catch (e) {
            if (
              e instanceof ccxt.NetworkError &&
              !(e instanceof ccxt.InvalidNonce)
            )
              throw e;
            bail(e);
          }
        };
        const callClosed = async (bail: (e: Error) => void) => {
          try {
            return await this.connectors[userExAccId].fetchClosedOrders(
              this.getSymbol(asset, currency),
              creationDate
            );
          } catch (e) {
            if (
              e instanceof ccxt.NetworkError &&
              !(e instanceof ccxt.InvalidNonce)
            )
              throw e;
            bail(e);
          }
        };
        const openOrders = await retry(callOpen, this.retryOptions);
        const closedOrders = await retry(callClosed, this.retryOptions);
        orders = [...closedOrders, ...openOrders];
      } else {
        this.logger.error(`Can't fetch orders from ${exchange}`);
        return null;
      }

      if (!orders || !Array.isArray(orders) || orders.length === 0) return null;

      const similarOrders = orders
        .filter(
          (o) =>
            o.side === direction &&
            o.timestamp >= creationDate &&
            o.symbol === this.getSymbol(asset, currency) &&
            o.amount === volume &&
            o.type === type
        )
        .sort((a, b) => sortAsc(a.timestamp, b.timestamp));
      if (
        !similarOrders ||
        !Array.isArray(similarOrders) ||
        similarOrders.length === 0
      )
        return null;
      let unknownOrders: Order[] = [];
      for (const similarOrder of similarOrders) {
        const ordersInDB = await this.broker.call(
          `${cpz.Service.DB_USER_ORDERS}.find`,
          {
            query: {
              userExAccId,
              exId: similarOrder.id
            }
          }
        );
        if (
          !ordersInDB ||
          !Array.isArray(ordersInDB) ||
          ordersInDB.length === 0
        ) {
          unknownOrders.push(similarOrder);
        }
      }
      if (unknownOrders.length === 0) return null;

      const existedOrder = unknownOrders.sort((a, b) =>
        sortAsc(a.timestamp, b.timestamp)
      )[0];

      return existedOrder;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  async checkOrder(
    order: cpz.Order
  ): Promise<{
    order: cpz.Order;
    nextJob?: {
      type: cpz.OrderJobType;
      priority: cpz.Priority;
      nextJobAt: string;
    };
  }> {
    try {
      const { userExAccId, exId, exchange, asset, currency } = order;
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[userExAccId].fetchOrder(
            exId,
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          if (
            e instanceof ccxt.NetworkError &&
            !(e instanceof ccxt.InvalidNonce)
          )
            throw e;
          bail(e);
        }
      };
      const response: {
        id: string;
        datetime: string;
        timestamp: number;
        lastTradeTimestamp: number;
        status: "open" | "closed" | "canceled";
        symbol: string;
        type: "market" | "limit";
        side: "buy" | "sell";
        price: number;
        average?: number;
        amount: number;
        filled: number;
        remaining: number;
        cost: number;
        trades: ccxt.Trade[];
        fee: ccxt.Fee;
        info: any;
      } = await retry(call, this.retryOptions);

      const {
        datetime: exTimestamp,
        status: orderStatus,
        price,
        average,
        amount: volume,
        remaining,
        filled,
        fee
      } = response;
      const executed =
        (filled && +filled) || (volume && remaining && +volume - +remaining);
      const status =
        orderStatus === cpz.OrderStatus.canceled && executed && executed > 0
          ? cpz.OrderStatus.closed
          : <cpz.OrderStatus>orderStatus;
      return {
        order: {
          ...order,
          exTimestamp: exTimestamp && dayjs.utc(exTimestamp).toISOString(),
          exLastTradeAt: this.getCloseOrderDate(<string>exchange, response),
          status,
          price: (average && +average) || (price && +price),
          volume: volume && +volume,
          remaining: remaining && +remaining,
          executed,
          fee: (fee && fee.cost) || 0,
          lastCheckedAt: dayjs.utc().toISOString(),
          nextJob:
            status === cpz.OrderStatus.canceled ||
            status === cpz.OrderStatus.closed
              ? null
              : {
                  type: cpz.OrderJobType.check
                },

          error: null
        },
        nextJob:
          status === cpz.OrderStatus.canceled ||
          status === cpz.OrderStatus.closed
            ? null
            : {
                type: cpz.OrderJobType.check,
                priority: cpz.Priority.low,
                nextJobAt: dayjs
                  .utc()
                  .add(ORDER_CHECK_TIMEOUT, cpz.TimeUnit.second)
                  .toISOString()
              }
      };
    } catch (err) {
      this.logger.error(err, order);
      if (
        err instanceof ccxt.AuthenticationError ||
        err instanceof ccxt.InsufficientFunds ||
        err instanceof ccxt.InvalidNonce
      ) {
        throw err;
      }
      if (
        err instanceof ccxt.ExchangeError ||
        err instanceof ccxt.NetworkError ||
        err instanceof ccxt.InvalidOrder
      ) {
        return {
          order: {
            ...order,
            error: this.getErrorMessage(err)
          },
          nextJob: {
            type: cpz.OrderJobType.check,
            priority: cpz.Priority.low,
            nextJobAt: dayjs
              .utc()
              .add(ORDER_CHECK_TIMEOUT * 5, cpz.TimeUnit.second)
              .toISOString()
          }
        };
      }
      throw err;
    }
  }

  async cancelOrder(
    order: cpz.Order
  ): Promise<{
    order: cpz.Order;
    nextJob?: {
      type: cpz.OrderJobType;
      priority: cpz.Priority;
      nextJobAt: string;
    };
  }> {
    try {
      const { userExAccId, exId, asset, currency } = order;
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.connectors[userExAccId].cancelOrder(
            exId,
            this.getSymbol(asset, currency)
          );
        } catch (e) {
          if (
            e instanceof ccxt.NetworkError &&
            !(e instanceof ccxt.InvalidNonce)
          )
            throw e;
          bail(e);
        }
      };
      await retry(call, this.retryOptions);
      return this.checkOrder(order);
    } catch (err) {
      this.logger.warn(err, order);
      if (
        err instanceof ccxt.AuthenticationError ||
        err instanceof ccxt.InsufficientFunds ||
        err instanceof ccxt.InvalidNonce
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
          order: {
            ...order,
            error: this.getErrorMessage(err)
          },
          nextJob: {
            type: cpz.OrderJobType.cancel,
            priority: cpz.Priority.high,
            nextJobAt: dayjs
              .utc()
              .add(ORDER_CHECK_TIMEOUT, cpz.TimeUnit.second)
              .toISOString()
          }
        };
      }
      throw err;
    }
  }
}

export = PrivateConnectorWorkerService;

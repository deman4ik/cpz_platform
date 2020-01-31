import { Service, ServiceBroker, Context } from "moleculer";
import socketio from "socket.io-client";
import cron from "node-cron";
import RedisLock from "../mixins/redislock";
import { v4 as uuid } from "uuid";
import { cpz } from "../@types";
import dayjs from "../lib/dayjs";
import { capitalize, chunkArray, uniqueElementsBy, round } from "../utils";
import Timeframe from "../utils/timeframe";
import Auth from "../mixins/auth";

/**
 * Watching streaming market data and creating candles
 *
 * @class ExwatcherService
 * @extends {Service}
 */
class ExwatcherService extends Service {
  /**
   *Creates an instance of ExwatcherService.
   * @param {ServiceBroker} broker
   * @memberof ExwatcherService
   */
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.EXWATCHER,
      mixins: [Auth, RedisLock()],
      dependencies: [
        cpz.Service.PUBLIC_CONNECTOR,
        cpz.Service.DB_EXWATCHERS,
        cpz.Service.DB_CANDLES_CURRENT,
        cpz.Service.IMPORTER_RUNNER,
        `${cpz.Service.DB_CANDLES}1`,
        `${cpz.Service.DB_CANDLES}5`,
        `${cpz.Service.DB_CANDLES}15`,
        `${cpz.Service.DB_CANDLES}30`,
        `${cpz.Service.DB_CANDLES}60`,
        `${cpz.Service.DB_CANDLES}120`,
        `${cpz.Service.DB_CANDLES}240`,
        `${cpz.Service.DB_CANDLES}480`,
        `${cpz.Service.DB_CANDLES}720`,
        `${cpz.Service.DB_CANDLES}1440`
      ],
      settings: {
        graphql: {
          type: `
        input Market {
          exchange: String!
          asset: String!
          currency: String!
        }
        `
        }
      },
      /**
       * Actions
       */
      actions: {
        /**
         * Subscribe
         *
         * @param {String} exchange - Exchange
         * @param {String} asset - Asset
         * @param {String} currency - Currency
         */
        subscribe: {
          params: {
            exchange: "string",
            asset: "string",
            currency: "string"
          },
          graphql: {
            mutation:
              "exwatcherSubscribe(exchange: String!, asset: String!, currency: String!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: this.authAction
          },
          async handler(
            ctx: Context<{
              exchange: string;
              asset: string;
              currency: string;
            }>
          ) {
            return await this.addSubscription(
              ctx.params.exchange,
              ctx.params.asset,
              ctx.params.currency
            );
          }
        },
        /**
         * Subscribe many
         *
         * @param {{exchange: string, asset: string, currency: string}[]} subscriptions - subscriptions
         */
        subscribeMany: {
          params: {
            subscriptions: {
              type: "array",
              items: {
                type: "object",
                props: {
                  exchange: "string",
                  asset: "string",
                  currency: "string"
                }
              }
            }
          },
          graphql: {
            mutation:
              "exwatcherSubscribeMany(subscriptions: [Market!]!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: this.authAction
          },
          async handler(
            ctx: Context<{
              subscriptions: {
                exchange: string;
                asset: string;
                currency: string;
              }[];
            }>
          ) {
            try {
              await Promise.all(
                ctx.params.subscriptions.map(
                  async (sub: {
                    exchange: string;
                    asset: string;
                    currency: string;
                  }) =>
                    this.addSubscription(sub.exchange, sub.asset, sub.currency)
                )
              );
              return { success: true };
            } catch (e) {
              this.logger.error(e);
              return { success: false, error: e.message };
            }
          }
        },
        /**
         * Unsubscribe
         *
         * @param {String} exchange - Exchange
         * @param {String} asset - Asset
         * @param {String} currency - Currency
         */
        unsubscribe: {
          params: {
            exchange: "string",
            asset: "string",
            currency: "string"
          },
          graphql: {
            mutation:
              "exwatcherUnsubscribe(exchange: String!, asset: String!, currency: String!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: this.authAction
          },
          async handler(
            ctx: Context<{
              exchange: string;
              asset: string;
              currency: string;
            }>
          ) {
            return await this.removeSubscription(
              ctx.params.exchange,
              ctx.params.asset,
              ctx.params.currency
            );
          }
        },
        /**
         * Unsubscribe many
         *
         * @param {{exchange: string, asset: string, currency: string}[]} subscriptions - subscriptions
         */
        unsubscribeMany: {
          params: {
            subscriptions: {
              type: "array",
              items: {
                type: "object",
                props: {
                  exchange: "string",
                  asset: "string",
                  currency: "string"
                }
              }
            }
          },
          graphql: {
            mutation:
              "exwatcherUnsubscribeMany(subscriptions: [Market!]!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: this.authAction
          },
          async handler(
            ctx: Context<{
              subscriptions: {
                exchange: string;
                asset: string;
                currency: string;
              }[];
            }>
          ) {
            try {
              await Promise.all(
                ctx.params.subscriptions.map(
                  async (sub: {
                    exchange: string;
                    asset: string;
                    currency: string;
                  }) =>
                    this.removeSubscription(
                      sub.exchange,
                      sub.asset,
                      sub.currency
                    )
                )
              );
              return { success: true };
            } catch (e) {
              this.logger.error(e);
              return { success: false, error: e.message };
            }
          }
        }
      },
      /**
       * Events
       */
      events: {
        [cpz.Event.IMPORTER_FINISHED]: this.handleImporterFinishedEvent,
        [cpz.Event.IMPORTER_FAILED]: this.handleImporterFailedEvent
      },
      started: this.startedService,
      stopped: this.stoppedService
    });
  }

  preloadComplete = false;
  trades: { [key: string]: cpz.ExwatcherTrade[] } = {};
  subscriptions: { [key: string]: cpz.Exwatcher } = {};
  candlesCurrent: { [key: string]: { [key: string]: cpz.Candle } } = {};
  socket: SocketIOClient.Socket = undefined;
  cronCandlecreator: cron.ScheduledTask = cron.schedule(
    "* * * * * *",
    this.candlecreator.bind(this),
    {
      scheduled: false
    }
  );
  cronCheck: cron.ScheduledTask = cron.schedule(
    "*/30 * * * * *",
    this.check.bind(this),
    {
      scheduled: false
    }
  );

  get activeSubscriptions() {
    return Object.values(this.subscriptions).filter(
      ({ status }) => status === cpz.ExwatcherStatus.subscribed
    );
  }
  /**
   * Service started lifecycle event handler
   */
  async startedService() {
    this.socket = socketio("https://streamer.cryptocompare.com/", {
      transports: ["websocket"]
    });
    this.socket.on("connect", this.socketOnConnect.bind(this));
    this.socket.on("m", this.socketOnMessage.bind(this));
    this.socket.on("disconnect", this.socketOnDisconnect.bind(this));
    this.socket.on("error", this.socketOnError.bind(this));
    this.socket.on("reconnect_failed", this.socketOnReconnectFailed.bind(this));
    this.cronCandlecreator.start();
    this.cronCheck.start();
  }

  /**
   * Service stopped lifecycle event handler
   */
  async stoppedService() {
    this.cronCandlecreator.stop();
    this.cronCheck.stop();
    await this.unsubscribeAll();
    this.socket.close();
  }

  /**
   * importer.finished event handler
   *
   * @param {Context} ctx
   * @memberof ExwatcherService
   */
  async handleImporterFinishedEvent(
    ctx: Context<{
      id: string;
    }>
  ) {
    const { id: importerId } = ctx.params;
    this.logger.info(`Importer ${importerId} finished!`);
    const subscription = Object.values(this.subscriptions).find(
      (sub: cpz.Exwatcher) => sub.importerId === importerId
    );
    await this.subscribe(subscription);
  }

  /**
   * importer.failed event handler
   *
   * @param {Context} ctx
   * @memberof ExwatcherService
   */
  async handleImporterFailedEvent(
    ctx: Context<{
      id: string;
      error: any;
    }>
  ) {
    const { id: importerId, error } = ctx.params;
    this.logger.warn(`Importer ${importerId} failed!`, error);

    const subscription = Object.values(this.subscriptions).find(
      (sub: cpz.Exwatcher) => sub.importerId === importerId
    );

    if (subscription && subscription.id) {
      this.subscriptions[subscription.id].status = cpz.ExwatcherStatus.failed;
      this.subscriptions[subscription.id].error = error;
      await this.saveSubscription(this.subscriptions[subscription.id]);
    }
  }

  /**
   * Check socket connection and pending subscriptions
   *
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async check(): Promise<void> {
    try {
      if (!this.socket.connected) {
        this.logger.warn("Socket not connected. Reconnecting...");
        this.socket.connect();
        return;
      }
      const pendingSubscriptions = Object.values(
        this.subscriptions
      ).filter(({ status }) =>
        [
          cpz.ExwatcherStatus.pending,
          cpz.ExwatcherStatus.unsubscribed,
          cpz.ExwatcherStatus.failed
        ].includes(status)
      );
      if (pendingSubscriptions.length > 0)
        await Promise.all(
          pendingSubscriptions.map(
            async ({ exchange, asset, currency }: cpz.Exwatcher) =>
              this.addSubscription(exchange, asset, currency)
          )
        );
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Resubscribe
   *
   * @memberof ExwatcherService
   */
  async resubscribe() {
    try {
      const subscriptions: cpz.Exwatcher[] = await this.broker.call(
        `${cpz.Service.DB_EXWATCHERS}.find`,
        {
          query: {
            node_id: this.broker.nodeID
          }
        }
      );
      if (
        subscriptions &&
        Array.isArray(subscriptions) &&
        subscriptions.length > 0
      ) {
        await Promise.all(
          subscriptions.map(
            async ({ id, exchange, asset, currency }: cpz.Exwatcher) => {
              if (
                !this.subscriptions[id] ||
                (this.subscriptions[id] &&
                  (this.subscriptions[id].status !==
                    cpz.ExwatcherStatus.subscribed ||
                    this.subscriptions[id].status !==
                      cpz.ExwatcherStatus.importing))
              ) {
                await this.addSubscription(exchange, asset, currency);
              }
            }
          )
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Unsubscribe all
   *
   * @memberof ExwatcherService
   */
  async unsubscribeAll() {
    try {
      await Promise.all(
        Object.keys(this.subscriptions).map(async id => {
          this.subscriptions[id].status = cpz.ExwatcherStatus.unsubscribed;
          await this.saveSubscription(this.subscriptions[id]);
        })
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Add new market data subscription
   *
   * @param {string} exchange
   * @param {string} asset
   * @param {string} currency
   * @returns {Promise<{ success: boolean; subscription?: cpz.Exwatcher; error?: any }>}
   * @memberof ExwatcherService
   */
  async addSubscription(
    exchange: string,
    asset: string,
    currency: string
  ): Promise<{ success: boolean; subscription?: cpz.Exwatcher; error?: any }> {
    const id = `${exchange}.${asset}.${currency}`;
    this.logger.info(`Adding ${id} subscription...`);
    try {
      if (
        !this.subscriptions[id] ||
        [
          cpz.ExwatcherStatus.pending,
          cpz.ExwatcherStatus.unsubscribed,
          cpz.ExwatcherStatus.failed
        ].includes(this.subscriptions[id].status)
      ) {
        this.subscriptions[id] = {
          id,
          exchange,
          asset,
          currency,
          status: cpz.ExwatcherStatus.pending,
          nodeID: this.broker.nodeID,
          importerId: null,
          error: null
        };

        const importerId = await this.importRecentCandles(
          this.subscriptions[id]
        );
        if (importerId) {
          this.subscriptions[id].status = cpz.ExwatcherStatus.importing;
          this.subscriptions[id].importerId = importerId;
          await this.saveSubscription(this.subscriptions[id]);
        }
      }
      return {
        success: true
      };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e
      };
    }
  }

  /**
   * Remove market data subscription
   *
   * @param {string} exchange
   * @param {string} asset
   * @param {string} currency
   * @returns {Promise<{
   *     success: boolean;
   *     id: string;
   *     status: string;
   *     error?: any;
   *   }>}
   * @memberof ExwatcherService
   */
  async removeSubscription(
    exchange: string,
    asset: string,
    currency: string
  ): Promise<{
    success: boolean;
    error?: any;
  }> {
    const id = `${exchange}.${asset}.${currency}`;
    try {
      if (this.subscriptions[id]) {
        await this.unsubscribeSocket(id);
        await this.deleteSubscription(id);
        delete this.subscriptions[id];
        delete this.candlesCurrent[id];
        delete this.trades[id];
      }
      return {
        success: true
      };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e
      };
    }
  }

  /**
   * Subscribe to market data
   *
   * @param {cpz.Exwatcher} subscription
   * @memberof ExwatcherService
   */
  async subscribe(subscription: cpz.Exwatcher) {
    if (subscription) {
      const { id, status } = subscription;
      if (status !== cpz.ExwatcherStatus.subscribed) {
        try {
          this.trades[id] = [];
          this.candlesCurrent[id] = {};
          const subscribed = await this.subscribeSocket(id);
          if (subscribed) {
            await this.loadCurrentCandles(this.subscriptions[id]);
            this.subscriptions[id].status = cpz.ExwatcherStatus.subscribed;
            this.logger.info(`Subscribed ${id}`);
          } else {
            this.subscriptions[id].status = cpz.ExwatcherStatus.failed;
          }
          await this.saveSubscription(this.subscriptions[id]);
        } catch (e) {
          this.logger.error(e);
          this.subscriptions[id].status = cpz.ExwatcherStatus.failed;
          await this.saveSubscription(this.subscriptions[id]);
        }
      }
    }
  }

  /**
   * Add subscription to socket
   *
   * @param {string} id
   * @returns {Promise<boolean>}
   * @memberof ExwatcherService
   */
  async subscribeSocket(id: string): Promise<boolean> {
    const { exchange, asset, currency } = this.subscriptions[id];
    const capExchange = capitalize(exchange);
    const tradesSub = `0~${capExchange}~${asset}~${currency}`;
    const ticksSub = `2~${capExchange}~${asset}~${currency}`;
    if (this.socket.connected) {
      this.socket.emit("SubAdd", {
        subs: [tradesSub, ticksSub]
      });
      this.logger.info(`Subscribed socket ${id}`);
      return true;
    }
    this.logger.error(
      `Failed to subscribed socket ${id}, socket not connected`
    );
    return false;
  }

  /**
   * Remove subscription from socket
   *
   * @param {string} id
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async unsubscribeSocket(id: string): Promise<void> {
    const { exchange, asset, currency } = this.subscriptions[id];
    const capExchange = capitalize(exchange);
    const tradesSub = `0~${capExchange}~${asset}~${currency}`;
    const ticksSub = `2~${capExchange}~${asset}~${currency}`;
    if (this.socket.connected) {
      this.socket.emit("SubRemove", {
        subs: [tradesSub, ticksSub]
      });
      this.logger.info(`Unsubscribed socket ${id}`);
    }
  }

  /**
   * Starts Import required amount if recent candles from exchange
   *
   * @param {cpz.Exwatcher} subscription
   * @returns {Promise<string>}
   * @memberof ExwatcherService
   */
  async importRecentCandles(subscription: cpz.Exwatcher): Promise<string> {
    const { exchange, asset, currency } = subscription;
    const { id } = await this.broker.call(
      `${cpz.Service.IMPORTER_RUNNER}.startRecent`,
      {
        exchange,
        asset,
        currency
      }
    );
    return id;
  }

  /**
   * Loads current candles from exchange in all available timeframes
   *
   * @param {cpz.Exwatcher} subscription
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async loadCurrentCandles(subscription: cpz.Exwatcher): Promise<void> {
    const { id, exchange, asset, currency } = subscription;
    this.logger.info(`Loading current candles ${id}`);
    if (!Object.prototype.hasOwnProperty.call(this.candlesCurrent, id))
      this.candlesCurrent[id] = {};
    await Promise.all(
      Timeframe.validArray.map(async timeframe => {
        const candle = await this.broker.call(
          `${cpz.Service.PUBLIC_CONNECTOR}.getCurrentCandle`,
          {
            exchange,
            asset,
            currency,
            timeframe
          },
          {
            retries: 20
          }
        );
        this.candlesCurrent[id][timeframe] = {
          ...candle,
          id: `${candle.exchange}.${candle.asset}.${candle.currency}.${candle.timeframe}`
        };
        await this.saveCurrentCandles([this.candlesCurrent[id][timeframe]]);
      })
    );
  }

  /**
   * Handle Socket Connect Event
   *
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async socketOnConnect(): Promise<void> {
    this.logger.info("Socket connect");
    await this.resubscribe();
  }

  /**
   * Process new message from socket
   *
   * @param {string} message
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async socketOnMessage(message: string): Promise<void> {
    const data = this.processData(message);
    if (data) {
      const id = `${data.exchange}.${data.asset}.${data.currency}`;
      const { status } = this.subscriptions[id];
      if (
        this.preloadComplete &&
        status &&
        status === cpz.ExwatcherStatus.subscribed
      ) {
        if (data.type === "trade") {
          this.saveTrade(data);
        }
        if (data.type === "tick") {
          this.logger.info(
            `${data.timestamp} ${id} ${data.type} ${data.price} `
          );
          await this.publishTick(data);
        }
      }
    }
  }

  /**
   * Save trade to local array
   *
   * @param {cpz.ExwatcherTrade} trade
   * @memberof ExwatcherService
   */
  saveTrade(trade: cpz.ExwatcherTrade): void {
    this.trades[`${trade.exchange}.${trade.asset}.${trade.currency}`].push(
      trade
    );
  }

  /**
   * Publish tick.new event
   *
   * @param {cpz.ExwatcherTrade} tick
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async publishTick(tick: cpz.ExwatcherTrade): Promise<void> {
    await this.broker.emit(cpz.Event.TICK_NEW, tick);
  }

  /**
   * Save subscription state to DB
   *
   * @param {cpz.Exwatcher} subscription
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async saveSubscription(subscription: cpz.Exwatcher): Promise<void> {
    await this.broker.call(`${cpz.Service.DB_EXWATCHERS}.upsert`, {
      entity: subscription
    });
  }

  /**
   * Delete subscription state in DB
   *
   * @param {string} id
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async deleteSubscription(id: string): Promise<void> {
    await this.broker.call(`${cpz.Service.DB_EXWATCHERS}.remove`, {
      id
    });
  }

  /**
   * Handle Socket Disconnect Event
   *
   * @param {string} e
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async socketOnDisconnect(e: string): Promise<void> {
    this.logger.warn("Socket disconnect", e);
    await this.unsubscribeAll();
  }

  /**
   * Handle Socket Error Event
   *
   * @param {string} e
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async socketOnError(e: string): Promise<void> {
    this.logger.error("Socker error", e);
    await this.unsubscribeAll();
  }

  /**
   * Handle Socket ReconnectFailed Event
   *
   * @param {string} e
   * @memberof ExwatcherService
   */
  socketOnReconnectFailed(e: string): void {
    this.logger.error("Socket reconnect failed", e);
  }

  /**
   * Parse trade direction
   *
   * @param {string} dir
   * @returns {string}
   * @memberof ExwatcherService
   */
  getDirection(dir: string): string {
    switch (dir) {
      case "1":
        return "up";
      case "2":
        return "down";
      case "4":
        return "unchanged";
      default:
        return "unknown";
    }
  }

  /**
   * Parse incoming market data
   *
   * @param {string} value
   * @returns {cpz.ExwatcherTrade}
   * @memberof ExwatcherService
   */
  processData(value: string): cpz.ExwatcherTrade {
    const valuesArray = value.split("~");

    const type = valuesArray[0];

    if (type === "2") {
      // {Type}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{MaskInt}

      const mask = valuesArray[valuesArray.length - 1].toString().slice(-1);
      if (mask === "9") {
        return {
          type: "tick",
          exchange: valuesArray[1].toLowerCase(),
          asset: valuesArray[2],
          currency: valuesArray[3],
          side: this.getDirection(valuesArray[4]),
          price: round(parseFloat(valuesArray[5]), 6),
          time: parseInt(valuesArray[6], 10) * 1000,
          timestamp: dayjs
            .utc(parseInt(valuesArray[6], 10) * 1000)
            .toISOString(),
          amount: round(parseFloat(valuesArray[8]), 6),
          tradeId: valuesArray[9]
        };
      }
    }
    if (type === "0") {
      // {SubscriptionId}~{ExchangeName}~{CurrencySymbol}~{CurrencySymbol}~{Flag}~{TradeId}~{TimeStamp}~{Quantity}~{Price}~{Total}
      return {
        type: "trade",
        exchange: valuesArray[1].toLowerCase(),
        asset: valuesArray[2],
        currency: valuesArray[3],
        side: this.getDirection(valuesArray[4]),
        tradeId: valuesArray[5],
        time: parseInt(valuesArray[6], 10) * 1000,
        timestamp: dayjs.utc(parseInt(valuesArray[6], 10) * 1000).toISOString(),
        amount: round(parseFloat(valuesArray[7]), 6),
        price: round(parseFloat(valuesArray[8]), 6)
      };
    }
    if (type === "3") {
      if (valuesArray[1] === "LOADCOMPLETE") this.preloadComplete = true;
    }
    return null;
  }

  /**
   * Creating candles from trades
   *
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async candlecreator(): Promise<void> {
    try {
      // Текущие дата и время - минус одна секунда
      const date = dayjs.utc().add(-1, "second");
      // Есть ли подходящие по времени таймфреймы
      const currentTimeframes = Timeframe.timeframesByDate(date.toISOString());

      let closedCandles: { [key: string]: cpz.Candle[] } = {};

      if (currentTimeframes.length > 0) {
        // Сброс текущих свечей
        currentTimeframes.forEach(timeframe => {
          closedCandles[timeframe] = [];
          this.activeSubscriptions.forEach(({ id }: cpz.Exwatcher) => {
            if (this.candlesCurrent[id] && this.candlesCurrent[id][timeframe]) {
              closedCandles[timeframe].push({
                ...this.candlesCurrent[id][timeframe],
                id: uuid()
              });
              const { close } = this.candlesCurrent[id][timeframe];
              this.candlesCurrent[id][timeframe].time = date
                .startOf("minute")
                .valueOf();
              this.candlesCurrent[id][timeframe].timestamp = date
                .startOf("minute")
                .toISOString();
              this.candlesCurrent[id][timeframe].high = close;
              this.candlesCurrent[id][timeframe].low = close;
              this.candlesCurrent[id][timeframe].open = close;
              this.candlesCurrent[id][timeframe].volume = 0;
              this.candlesCurrent[id][timeframe].type = cpz.CandleType.previous;
            }
          });
        });
      }

      await Promise.all(
        this.activeSubscriptions.map(async ({ id }: cpz.Exwatcher) => {
          if (this.trades[id]) {
            // Запрашиваем все прошедшие трейды
            const trades = this.trades[id].filter(
              ({ time }: cpz.ExwatcherTrade) => time <= date.valueOf()
            );

            // Если были трейды
            if (trades.length > 0) {
              // Оставляем остальные трейды
              this.trades[id] = this.trades[id].filter(
                ({ time }: cpz.ExchangeTrade) => time > date.valueOf()
              );

              const currentCandles: cpz.Candle[] = [];
              Timeframe.validArray.forEach(async timeframe => {
                const dateFrom = Timeframe.getCurrentSince(1, timeframe);

                const currentTrades = trades.filter(
                  ({ time }: cpz.ExwatcherTrade) => time >= dateFrom
                );

                if (currentTrades.length > 0) {
                  const prices = currentTrades.map(t => +t.price);
                  if (this.candlesCurrent[id][timeframe].volume === 0)
                    this.candlesCurrent[id][timeframe].open = +currentTrades[0]
                      .price;
                  this.candlesCurrent[id][timeframe].high = Math.max(
                    this.candlesCurrent[id][timeframe].high,
                    ...prices
                  );
                  this.candlesCurrent[id][timeframe].low = Math.min(
                    this.candlesCurrent[id][timeframe].low,
                    ...prices
                  );
                  this.candlesCurrent[id][timeframe].close = +currentTrades[
                    currentTrades.length - 1
                  ].price;
                  this.candlesCurrent[id][timeframe].volume +=
                    +currentTrades
                      .map(t => t.amount)
                      .reduce((a, b) => a + b, 0) || 0;
                  this.candlesCurrent[id][timeframe].type =
                    this.candlesCurrent[id][timeframe].volume === 0
                      ? cpz.CandleType.previous
                      : cpz.CandleType.created;
                  currentCandles.push(this.candlesCurrent[id][timeframe]);
                }
              });

              if (currentCandles.length > 0) {
                await this.saveCurrentCandles(currentCandles);
              }
            }
          }
        })
      );

      if (Object.keys(closedCandles).length > 0) {
        await Promise.all(
          Object.keys(closedCandles).map(async timeframe => {
            const candles = closedCandles[timeframe];
            if (candles && Array.isArray(candles) && candles.length > 0) {
              this.logger.info(
                `New ${uniqueElementsBy(
                  candles,
                  (a, b) =>
                    a.exchange === b.exchange &&
                    a.asset === b.asset &&
                    a.currency === b.currency
                ).map(
                  ({ exchange, asset, currency }) =>
                    `${exchange}.${asset}.${currency}.${timeframe}`
                )} candles`
              );
              await this.saveCandles(candles);
              await Promise.all(
                candles.map(async candle => {
                  if (candle.type !== cpz.CandleType.previous)
                    await this.broker.emit(cpz.Event.CANDLE_NEW, candle);
                })
              );
            }
          })
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Save current candles
   *
   * @param {cpz.Candle[]} candles
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async saveCurrentCandles(candles: cpz.Candle[]): Promise<void> {
    try {
      const chunks = chunkArray(candles, 500);
      for (const chunk of chunks) {
        try {
          await this.broker.call(`${cpz.Service.DB_CANDLES_CURRENT}.upsert`, {
            entities: chunk
          });
        } catch (e) {
          this.logger.error(e);
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Save closed candles
   *
   * @param {cpz.Candle[]} candles
   * @returns {Promise<void>}
   * @memberof ExwatcherService
   */
  async saveCandles(candles: cpz.Candle[]): Promise<void> {
    try {
      const { timeframe } = candles[0];
      const chunks = chunkArray(candles, 500);
      for (const chunk of chunks) {
        try {
          await this.broker.call(
            `${cpz.Service.DB_CANDLES}${timeframe}.upsert`,
            {
              entities: chunk
            }
          );
        } catch (e) {
          this.logger.error(e);
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = ExwatcherService;

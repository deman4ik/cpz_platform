import { Service, ServiceBroker } from "moleculer";
import socketio from "socket.io-client";
import { cpz } from "../types/cpz";
import { capitalize } from "../utils";
import Timeframe from "../utils/timeframe";

class ExwatcherService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.EXWATCHER,
      dependencies: [
        cpz.Service.PUBLIC_CONNECTOR,
        cpz.Service.DB_EXWATCHERS,
        cpz.Service.DB_CANDLES_CURRENT,
        `${cpz.Service.DB_CANDLES}1`,
        `${cpz.Service.DB_CANDLES}5`,
        `${cpz.Service.DB_CANDLES}15`,
        `${cpz.Service.DB_CANDLES}30`,
        `${cpz.Service.DB_CANDLES}60`,
        `${cpz.Service.DB_CANDLES}120`,
        `${cpz.Service.DB_CANDLES}240`,
        `${cpz.Service.DB_CANDLES}1440`
      ],
      /**
       * Actions
       */
      actions: {
        /**
         * Connect
         *
         * @returns
         */
        connect() {
          if (!this.socket.connected) {
            this.socket.connect();
          }
        },

        disconnect() {
          this.socket.close();
        },
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
          async handler(ctx) {
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
          async handler(ctx) {
            return await Promise.all(
              ctx.params.subscriptions.map(
                async (sub: {
                  exchange: string;
                  asset: string;
                  currency: string;
                }) =>
                  this.addSubscription(sub.exchange, sub.asset, sub.currency)
              )
            );
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
          async handler(ctx) {
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
          async handler(ctx) {
            return await Promise.all(
              ctx.params.subscriptions.map(
                async (sub: {
                  exchange: string;
                  asset: string;
                  currency: string;
                }) =>
                  this.removeSubscription(sub.exchange, sub.asset, sub.currency)
              )
            );
          }
        }
      },
      /**
       * Events
       */
      events: {
        async [cpz.Event.IMPORTER_FINISHED](ctx) {
          const { id: importerId } = ctx.params;
          this.logger.info(`Importer ${importerId} finished!`);
          const subscription = Object.values(this.subscriptions).find(
            (sub: cpz.Exwatcher) => sub.importerId === importerId
          );
          await this.subscribe(subscription);
        }
      },
      started: this.startedService,
      stopped: this.stoppedService
    });
  }

  preloadComplete = false;
  trades: { [key: string]: cpz.ExwatcherTrade[] } = {};
  subscriptions: { [key: string]: cpz.Exwatcher } = {};
  candlesCurrent: { [key: string]: { [key: string]: cpz.Candle } } = {};
  socket = socketio("https://streamer.cryptocompare.com/", {
    transports: ["websocket"]
  });

  /**
   * Service started lifecycle event handler
   */
  async startedService() {
    this.socket.on("connect", this.socketOnConnect.bind(this));
    this.socket.on("m", this.socketOnMessage.bind(this));
    this.socket.on("disconnect", this.socketOnDisconnect.bind(this));
    this.socket.on("error", this.socketOnError.bind(this));
    this.socket.on("reconnect_failed", this.socketOnReconnectFailed.bind(this));
  }

  /**
   * Service stopped lifecycle event handler
   */
  async stoppedService() {
    this.socket.close();
  }

  /**
   * Add new market data subscription
   *
   * @param exchange
   * @param asset
   * @param currency
   */
  async addSubscription(exchange: string, asset: string, currency: string) {
    const id = `${exchange}.${asset}.${currency}`;

    try {
      if (!this.subscriptions[id]) {
        this.subscriptions[id] = {
          id,
          exchange,
          asset,
          currency,
          status: cpz.ExwatcherStatus.pending,
          nodeId: this.broker.nodeID,
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
        success: true,
        subscription: this.subscriptions[id]
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
   * @returns
   * @memberof ExwatcherService
   */
  async removeSubscription(exchange: string, asset: string, currency: string) {
    const id = `${exchange}.${asset}.${currency}`;
    try {
      if (this.subscriptions[id]) {
        await this.unsubscribeSocket(id);
        await this.deleteSubscription(id);
        delete this.subscriptions[id];
      }

      return {
        success: true,
        id,
        status: cpz.ExwatcherStatus.unsubscribed
      };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        id,
        status: this.subscriptions[id].status,
        error: e
      };
    }
  }
  /**
   * Subscribe to market data
   *
   * @param subscription
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
            this.logger.info(`${id} subscribed`);
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
  async subscribeSocket(id: string) {
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
  async unsubscribeSocket(id: string) {
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
   * @returns
   * @memberof ExwatcherService
   */
  async importRecentCandles(subscription: cpz.Exwatcher) {
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
   * @memberof ExwatcherService
   */
  async loadCurrentCandles(subscription: cpz.Exwatcher) {
    const { id, exchange, asset, currency } = subscription;
    this.logger.info(`Loading current candles ${id}`);
    if (!Object.prototype.hasOwnProperty.call(this.candlesCurrent, id))
      this.candlesCurrent[id] = {};
    await Promise.all(
      Timeframe.validArray.map(async timeframe => {
        this.candlesCurrent[id][timeframe] = await this.broker.call(
          `${cpz.Service.PUBLIC_CONNECTOR}.getCurrentCandle`,
          {
            exchange,
            asset,
            currency,
            timeframe
          }
        );
      })
    );
    this.logger.info("Current candles", id, this.candlesCurrent[id]);
  }

  /**
   * Handle Socket Connect Event
   */
  socketOnConnect(): void {
    this.logger.info("Socket connect");
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
        this.logger.info(`${data.timestamp} ${id} ${data.type} ${data.price} `);
        if (data.type === "trade") {
          this.saveTrade(data);
        }
        if (data.type === "tick") await this.publishTick(data);
      }
    }
  }
  /**
   * Save trade to local array
   *
   * @param {cpz.ExwatcherTrade} trade
   */
  saveTrade(trade: cpz.ExwatcherTrade) {
    this.trades[`${trade.exchange}.${trade.asset}.${trade.currency}`].push(
      trade
    );
  }
  /**
   * Publish tick.new event
   *
   * @param {cpz.ExwatcherTrade} tick
   */
  async publishTick(tick: cpz.ExwatcherTrade) {
    await this.broker.emit(cpz.Event.TICK_NEW, tick);
  }
  /**
   * Save subscription state to DB
   *
   * @param {cpz.Exwatcher} subscription
   */
  async saveSubscription(subscription: cpz.Exwatcher) {
    await this.broker.call(`${cpz.Service.DB_EXWATCHERS}.upsert`, {
      entity: subscription
    });
  }
  /**
   * Delete subscription state in DB
   *
   * @param {cpz.Exwatcher} subscription
   */
  async deleteSubscription(id: string) {
    await this.broker.call(`${cpz.Service.DB_EXWATCHERS}.remove`, {
      id
    });
  }
  socketOnDisconnect(e: string): void {
    this.logger.warn("Socket disconnect", e);
  }
  socketOnError(e: string): void {
    this.logger.error("Socker error", e);
  }
  socketOnReconnectFailed(e: string): void {
    this.logger.error("Socket reconnect failed", e);
  }
  getDirection(dir: string) {
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
          price: parseFloat(valuesArray[5]),
          time: parseInt(valuesArray[6], 10) * 1000,
          timestamp: new Date(
            parseInt(valuesArray[6], 10) * 1000
          ).toISOString(),
          amount: parseFloat(valuesArray[8]),
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
        timestamp: new Date(parseInt(valuesArray[6], 10) * 1000).toISOString(),
        amount: parseFloat(valuesArray[7]),
        price: parseFloat(valuesArray[8])
      };
    }
    if (type === "3") {
      if (valuesArray[1] === "LOADCOMPLETE") this.preloadComplete = true;
    }
    return null;
  }
}

export default ExwatcherService;

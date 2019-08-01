import { ServiceSchema } from "moleculer";
import socketio from "socket.io-client";
import { cpz } from "../types/cpz";
import { capitalize } from "../utils";
import Timeframe from "../utils/timeframe";

const ExwatcherService: ServiceSchema = {
  name: cpz.Service.EXWATCHER,

  /**
   * Service settings
   */
  settings: {},

  /**
   * Service dependencies
   */
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
     * @param {cpz.AssetSymbol[]} subscriptions - subscriptions
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
          ctx.params.subscriptions.map(async (sub: cpz.AssetSymbol) =>
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
     * @param {cpz.AssetSymbol[]} subscriptions - subscriptions
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
          ctx.params.subscriptions.map(async (sub: cpz.AssetSymbol) =>
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

  /**
   * Methods
   */
  methods: {
    /**
     * Add new market data subscription
     *
     * @param exchange
     * @param asset
     * @param currency
     */
    async addSubscription(exchange, asset, currency) {
      const id = `${exchange}.${asset}.${currency}`;

      if (!this.subscriptions[id]) {
        this.subscriptions[id] = {
          id,
          exchange,
          asset,
          currency,
          status: cpz.ExwatcherStatus.importing,
          nodeId: this.broker.nodeID,
          importerId: null,
          error: null
        };

        const importerId = await this.importCurrentAmountCandles(
          this.subscriptions[id]
        );
        this.subscriptions[id].importerId = importerId;
        await this.saveSubscription(this.subscriptions[id]);
      }
      return this.subscriptions[id];
    },
    /**
     * Remove market data subscription
     *
     * @param exchange
     * @param asset
     * @param currency
     */
    async removeSubscription(exchange, asset, currency) {
      const id = `${exchange}.${asset}.${currency}`;
      if (this.subscriptions[id]) {
      }
      return {
        id,
        status: cpz.ExwatcherStatus.unsubscribed
      };
    },
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
    },
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
    },
    async unsubscribe(subscription: cpz.Exwatcher) {
      if (subscription) {
        const { id } = subscription;
        await this.unsubscribeSocket(id);
        await this.deleteSubscription(this.subscriptions[id]);
        delete this.subscriptions[id];
      }
    },
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
    },
    async importCurrentAmountCandles(subscription: cpz.Exwatcher) {
      const { exchange, asset, currency } = subscription;
      const { id } = await this.broker.call(
        `${cpz.Service.IMPORTER_RUNNER}.startCurrent`,
        {
          exchange,
          asset,
          currency
        }
      );
      return id;
    },
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
    },

    socketOnConnect(): void {
      this.logger.info("Socket connect");
    },
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
          this.logger.info(
            `${data.timestamp} ${id} ${data.type} ${data.price} `
          );
          if (data.type === "trade") {
            this.saveTrade(data);
          }
          if (data.type === "tick") await this.publishTick(data);
        }
      }
    },
    /**
     * Save trade to local array
     *
     * @param {cpz.ExwatcherTrade} trade
     */
    saveTrade(trade: cpz.ExwatcherTrade) {
      this.trades[`${trade.exchange}.${trade.asset}.${trade.currency}`].push(
        trade
      );
    },
    /**
     * Publish tick.new event
     *
     * @param {cpz.ExwatcherTrade} tick
     */
    async publishTick(tick: cpz.ExwatcherTrade) {
      await this.broker.emit(cpz.Event.TICK_NEW, tick);
    },
    /**
     * Save subscription state to DB
     *
     * @param {cpz.Exwatcher} subscription
     */
    async saveSubscription(subscription: cpz.Exwatcher) {
      await this.broker.call(`${cpz.Service.DB_EXWATCHERS}.upsert`, {
        entity: subscription
      });
    },
    /**
     * Delete subscription state in DB
     *
     * @param {cpz.Exwatcher} subscription
     */
    async deleteSubscription(subscription: cpz.Exwatcher) {
      await this.broker.call(`${cpz.Service.DB_EXWATCHERS}.upsert`, {
        entity: subscription
      });
    },
    socketOnDisconnect(e): void {
      this.logger.warn("Socket disconnect", e);
    },
    socketOnError(e): void {
      this.logger.error("Socker error", e);
    },
    socketOnReconnectFailed(e): void {
      this.logger.error("Socket reconnect failed", e);
    },
    getDirection(dir) {
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
    },
    processData(value: string) {
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
          timestamp: new Date(
            parseInt(valuesArray[6], 10) * 1000
          ).toISOString(),
          amount: parseFloat(valuesArray[7]),
          price: parseFloat(valuesArray[8])
        };
      }
      if (type === "3") {
        if (valuesArray[1] === "LOADCOMPLETE") this.preloadComplete = true;
      }
      return null;
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    this.preloadComplete = false;
    this.trades = {};
    this.subscriptions = {};
    this.candlesCurrent = {};
    this.socket = socketio("https://streamer.cryptocompare.com/", {
      transports: ["websocket"]
    });
  },

  /**
   * Service started lifecycle event handler
   */
  async started() {
    this.socket.on("connect", this.socketOnConnect);
    this.socket.on("m", this.socketOnMessage);
    this.socket.on("disconnect", this.socketOnDisconnect);
    this.socket.on("error", this.socketOnError);
    this.socket.on("reconnect_failed", this.socketOnReconnectFailed);
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {
    this.socket.close();
  }
};

export = ExwatcherService;

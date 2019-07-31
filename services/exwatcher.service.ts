import { ServiceSchema } from "moleculer";
import socketio from "socket.io-client";
import { cpz } from "../types/cpz";
import { capitalize } from "../utils";

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
        return await this.subscribe(
          ctx.params.exchange,
          ctx.params.asset,
          ctx.params.currency
        );
      }
    },
    subscribeMany: {
      params: {
        subcriptions: {
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
          ctx.params.subcriptions.map(async (sub: cpz.AssetSymbol) =>
            this.subscribe(sub.exchange, sub.asset, sub.currency)
          )
        );
      }
    },
    async unsubscribe() {
      let [[err, state]] = await this.broker.cacher.client
        .pipeline()
        .get(`marketwatcher.${this.broker.nodeID}`)
        .exec();
      state = JSON.parse(state);
      this.logger.info(state);
      return state;
    }
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {
    async subscribe(exchange, asset, currency) {
      const id = `${exchange}.${asset}.${currency}`;

      if (!this.subcriptions[id]) {
        this.subcriptions[id] = {
          id,
          exchange,
          asset,
          currency,
          status: cpz.ExwatcherStatus.importing,
          nodeId: this.broker.nodeID,
          importerId: null,
          error: null
        };

        const importerId = await this.importCurrentCandles(
          this.subcriptions[id]
        );
        this.subcriptions[id].importerId = importerId;
        await this.saveSubscription(this.subcriptions[id]);
      }
      return this.subcriptions[id];
    },
    async saveSubscription(subcription: cpz.Exwatcher) {
      await this.broker.call(`${cpz.Service.DB_EXWATCHERS}.upsert`, {
        entity: subcription
      });
    },
    async importCurrentCandles(subcription: cpz.Exwatcher) {
      const { exchange, asset, currency } = subcription;
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
    async subscribeSocket(id) {
      const { exchange, asset, currency } = this.subcriptions[id];
      const capExchange = capitalize(exchange);
      const tradesSub = `0~${capExchange}~${asset}~${currency}`;
      const ticksSub = `2~${capExchange}~${asset}~${currency}`;
      if (this.socket.connected) {
        this.socket.emit("SubAdd", {
          subs: [tradesSub, ticksSub]
        });
        this.subcriptions[id].status = cpz.ExwatcherStatus.subscribed;
      } else {
        this.subcriptions[id].status = cpz.ExwatcherStatus.failed;
      }
      await this.saveSubscription(id);
    },
    socketOnConnect(): void {
      this.logger.info("Socket connect");
    },
    async socketOnMessage(message: string): Promise<void> {
      const data = this.processData(message);
      if (this.preloadComplete && data) {
        this.logger.info(
          `${data.timestamp} ${data.exchange}.${data.asset}.${data.currency} ${
            data.type
          } ${data.price} `
        );
        if (data.type === "trade") {
          this.saveTrade(data);
        }
        if (data.type === "tick") await this.publishTick(data);
      }
    },
    saveTrade(trade) {
      this._trades[`${trade.asset}/${trade.currency}`].push(trade);
    },
    async publishTick(tick) {
      //TODO: Broadcast new tick event
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
    processData(value) {
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
            direction: this.getDirection(valuesArray[4]),
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
          direction: this.getDirection(valuesArray[4]),
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
    this.subcriptions = {};
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

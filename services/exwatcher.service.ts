import { ServiceSchema } from "moleculer";
import socketio from "socket.io-client";

const ExwatcherService: ServiceSchema = {
  name: "exwatcher",

  /**
   * Service settings
   */
  settings: {},

  /**
   * Service dependencies
   */
  dependencies: [],

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
      async handler(ctx) {
        const subscribtions = [
          `0~Bitfinex~BTC~USD`,
          `0~Bitfinex~ETH~USD`,
          `0~Bitfinex~XRP~USD`,
          `0~Bitfinex~BCH~USD`,
          `0~Kraken~BTC~USD`,
          `0~Kraken~ETH~USD`,
          `0~Kraken~XRP~USD`,
          `0~Kraken~BCH~USD`
        ];
        // set values in cache
        await this.broker.cacher.client
          .pipeline()
          .set(
            `marketwatcher.${this.broker.nodeID}`,
            JSON.stringify({
              subscribtions
            })
          )
          .exec();
        /*
       
        if (this.socket.connected) {
          this.socket.emit("SubAdd", {
            subs: subscribtions
          });
        }*/
        return { success: true };
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
    socketOnConnect(): void {
      this.logger.info("Socket connect");
    },
    socketOnMessage(message: string): void {
      this.logger.info("New message", message);
    },
    socketOnDisconnect(e): void {
      this.logger.warn("Socket disconnect", e);
    },
    socketOnError(e): void {
      this.logger.error("Socker error", e);
    },
    socketOnReconnectFailed(e): void {
      this.logger.error("Socket reconnect failed", e);
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
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

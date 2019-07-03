import { ServiceSchema } from "moleculer";
import ccxt from "ccxt";
import createFetchMethod from "../utils/fetch";
import { cpz } from "types/cpz";

const ExconnectorService: ServiceSchema = {
  name: "exconnector",

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
     * Welcome a username
     *
     * @param {String} name - User name
     */
    getMarket: {
      params: {
        exchange: "string",
        asset: "string",
        currency: "string"
      },
      async handler(ctx) {
        return this.getMarket(ctx.params);
      }
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
    async initConnector(exchange: cpz.ExchangeName) {
      if (!(exchange in this.publicConnectors)) {
        this.publicConnectors[exchange] = new ccxt[exchange]({
          fetchImplementation: this._fetch
        });
        await this.publicConnectors[exchange].loadMarkets();
      }
    },
    getSymbol(asset: string, currency: string): string {
      return `${asset}/${currency}`;
    },
    async getMarket({ exchange, asset, currency }: cpz.AssetCred) {
      const response = await this.publicConnectors[exchange].market(
        this.getSymbol(asset, currency)
      );
      return {
        exchange,
        asset,
        currency,
        amountLimits: {
          min: response.limits.amount.min,
          max: response.limits.amount.max
        },
        priceLimits: {
          min: response.limits.price.min,
          max: response.limits.price.max
        },
        costLimits: {
          min: response.limits.cost.min,
          max: response.limits.cost.max
        },
        pricePrecision: response.precision.price,
        amountPrecision: response.precision.amount
      };
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    this._fetch = createFetchMethod(process.env.PROXY_ENDPOINT_PUBLIC);
    this.publicConnectors = {};
  },

  /**
   * Service started lifecycle event handler
   */
  async started() {
    await this.initConnector("bitfinex");
  }

  /**
   * Service stopped lifecycle event handler
   */
  // stopped() {

  // },
};

export = ExconnectorService;

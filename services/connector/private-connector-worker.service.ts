import Moleculer, { Service, ServiceBroker, Errors, Context } from "moleculer";
import ccxt, { Exchange } from "ccxt";
import retry from "async-retry";
import { cpz } from "../../@types";
import dayjs from "../../lib/dayjs";
import { createFetchMethod } from "../../utils";

/**
 * Available exchanges
 */
type ExchangeName = "kraken" | "bitfinex";

/**
 * Private Exchange Connector Service
 *
 * @class PrivateConnectorService
 * @extends {Service}
 */
class PrivateConnectorService extends Service {
  /**
   *Creates an instance of PrivateConnectorService.
   * @param {ServiceBroker} broker
   * @memberof PrivateConnectorService
   */
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.PRIVATE_CONNECTOR_WORKER,
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
   * Retry exchange requests options
   *
   * @memberof PrivateConnectorService
   */
  retryOptions = {
    retries: 100,
    minTimeout: 0,
    maxTimeout: 100
  };

  /**
   * Custom fetch method with proxy agent
   *
   * @memberof PrivateConnectorService
   */
  _fetch = createFetchMethod(process.env.PROXY_ENDPOINT);

  /**
   * Initialize public CCXT instance
   *
   * @param {ExchangeName} exchange
   * @returns {Promise<void>}
   * @memberof PrivateConnectorService
   */
  async initConnector(exchange: ExchangeName): Promise<void> {
    if (!(exchange in this.publicConnectors)) {
      this.publicConnectors[exchange] = new ccxt[exchange]({
        fetchImplementation: this._fetch
      });
      const call = async (bail: (e: Error) => void) => {
        try {
          return await this.publicConnectors[exchange].loadMarkets();
        } catch (e) {
          if (e instanceof ccxt.NetworkError) throw e;
          bail(e);
        }
      };
      await retry(call, this.retryOptions);
    }
  }

  /**
   * Format currency pair symbol
   *
   * @param {string} asset
   * @param {string} currency
   * @returns {string}
   * @memberof PrivateConnectorService
   */
  getSymbol(asset: string, currency: string): string {
    return `${asset}/${currency}`;
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
      if (response && response.info)
        return {
          success: true
        };
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
}

export = PrivateConnectorService;

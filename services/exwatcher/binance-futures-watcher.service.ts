import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../../@types";
import WebSocket from "ws";
import cron from "node-cron";
import Timeframe from "../../utils/timeframe";
import RedisLock from "../../mixins/redislock";

class BinanceFuturesWatcherService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.BINANCE_FUTURES_WATCHER,
      mixins: [RedisLock()],
      started: this.startedService
    });
  }

  async startedService() {
    this.ws = new WebSocket("wss://fstream.binance.com/stream");

    this.ws.on("open", this.socketOnConnect.bind(this));
    this.ws.on("message", this.socketOnMessage.bind(this));
    this.ws.on("close", this.socketOnDisconnect.bind(this));
    this.ws.on("error", this.socketOnError.bind(this));
  }

  async socketOnConnect(): Promise<void> {
    this.logger.info("Socket connect");
    this.ws.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: ["BTCUSDT@kline_1m"],
        id: 1
      })
    );
  }

  async socketOnMessage(message: string): Promise<void> {
    this.logger.info(JSON.parse(message));
  }

  async socketOnDisconnect(e: string): Promise<void> {
    this.logger.warn("Socket disconnect", e);
  }

  async socketOnError(e: string): Promise<void> {
    this.logger.error("Socker error", e);
  }

  async subscribe(
    ctx: Context<{
      asset: string;
      currency: string;
    }>
  ): Promise<{
    success: boolean;
    exchange: string;
    asset: string;
    currency: string;
    error?: any;
  }> {
    const { asset, currency } = ctx.params;
    const exchange = "binance_futures";
    try {
      const id = `${exchange}.${asset}.${currency}`;

      const exists: cpz.Exwatcher = await ctx.call(
        `${cpz.Service.DB_EXWATCHERS}.get`,
        { id }
      );

      if (!exists || (exists && exists.status === cpz.ExwatcherStatus.failed)) {
        this.logger.info(`Adding ${id} subscription...`);

        const newSubscription: cpz.Exwatcher = {
          id,
          exchange,
          asset,
          currency,
          status: cpz.ExwatcherStatus.pending,
          nodeID: this.broker.nodeID,
          importerId: null,
          error: null
        };
        const { id: importerId, error } = await ctx.call(
          `${cpz.Service.IMPORTER_RUNNER}.startRecent`,
          {
            exchange,
            asset,
            currency
          }
        );

        if (importerId) {
          newSubscription.status = cpz.ExwatcherStatus.importing;
          newSubscription.importerId = importerId;
          await ctx.call(`${cpz.Service.DB_EXWATCHERS}.upsert`, {
            entity: newSubscription
          });
          return {
            success: true,
            exchange,
            asset,
            currency
          };
        } else {
          newSubscription.status = cpz.ExwatcherStatus.failed;
          newSubscription.error = error;
          await ctx.call(`${cpz.Service.DB_EXWATCHERS}.upsert`, {
            entity: newSubscription
          });
          return {
            success: false,
            exchange,
            asset,
            currency,
            error
          };
        }
      }
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        exchange,
        asset,
        currency,
        error: e.message
      };
    }
  }
}

export = BinanceFuturesWatcherService;

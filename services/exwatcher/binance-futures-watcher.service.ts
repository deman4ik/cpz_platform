import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../../@types";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";
import ccxtpro from "ccxt.pro";
import cron from "node-cron";
import Timeframe from "../../utils/timeframe";
import RedisLock from "../../mixins/redislock";
import { uniqueElementsBy, round } from "../../utils/helpers";
import { createFetchMethod } from "../../utils/fetch";

interface Trade {
  amount: number; // amount of base currency
  price: number; // float price in quote currency
  timestamp: number; // Unix timestamp in milliseconds
}
class BinanceFuturesWatcherService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.BINANCE_FUTURES_WATCHER,
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
      mixins: [RedisLock()],
      events: {
        [cpz.Event.IMPORTER_FINISHED]: this.handleImporterFinishedEvent,
        [cpz.Event.IMPORTER_FAILED]: this.handleImporterFailedEvent
      },
      actions: {
        subscribe: {
          params: {
            asset: "string",
            currency: "string"
          },
          async handler(
            ctx: Context<{
              asset: string;
              currency: string;
            }>
          ) {
            return this.addSubscription(ctx.params.asset, ctx.params.currency);
          }
        }
      },
      started: this.startedService,
      stopped: this.stoppedService
    });
  }
  exchange: string = "binance_futures";
  subscriptions: { [key: string]: cpz.Exwatcher } = {};
  candlesCurrent: { [key: string]: { [key: string]: cpz.Candle } } = {};
  lastTick: { [key: string]: cpz.ExchangePrice } = {};

  cronHandleTrades: cron.ScheduledTask = cron.schedule(
    "* * * * * *",
    this.handleTrades.bind(this),
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

  async startedService() {
    this.connector = new ccxtpro.binance({
      enableRateLimit: true,
      // fetchImplementation: createFetchMethod(process.env.PROXY_ENDPOINT),
      options: { defaultType: "future", OHLCVLimit: 100 }
    });
    await this.resubscribe();
    this.cronHandleTrades.start();
    this.cronCheck.start();
  }

  async stoppedService() {
    this.cronHandleTrades.stop();
    this.cronCheck.stop();
    await this.unsubscribeAll();
    await this.connector.close();
  }

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

  async check(): Promise<void> {
    try {
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
          pendingSubscriptions.map(async ({ asset, currency }: cpz.Exwatcher) =>
            this.addSubscription(asset, currency)
          )
        );
    } catch (e) {
      this.logger.error(e);
    }
  }

  async resubscribe() {
    try {
      const subscriptions: cpz.Exwatcher[] = await this.broker.call(
        `${cpz.Service.DB_EXWATCHERS}.find`,
        {
          query: {
            nodeID: this.broker.nodeID,
            exchange: this.exchange
          }
        }
      );
      if (
        subscriptions &&
        Array.isArray(subscriptions) &&
        subscriptions.length > 0
      ) {
        await Promise.all(
          subscriptions.map(async ({ id, asset, currency }: cpz.Exwatcher) => {
            if (
              !this.subscriptions[id] ||
              (this.subscriptions[id] &&
                (this.subscriptions[id].status !==
                  cpz.ExwatcherStatus.subscribed ||
                  this.subscriptions[id].status !==
                    cpz.ExwatcherStatus.importing))
            ) {
              await this.addSubscription(asset, currency);
            }
          })
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

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

  async addSubscription(
    asset: string,
    currency: string
  ): Promise<{ success: boolean; subscription?: cpz.Exwatcher; error?: any }> {
    const id = `${this.exchange}.${asset}.${currency}`;
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
          exchange: this.exchange,
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

  async removeSubscription(
    asset: string,
    currency: string
  ): Promise<{
    success: boolean;
    error?: any;
  }> {
    const id = `${this.exchange}.${asset}.${currency}`;
    try {
      if (this.subscriptions[id]) {
        //TODO unwatch when implemented in ccxt.pro
        await this.deleteSubscription(id);
        delete this.subscriptions[id];
        if (this.candlesCurrent[id]) delete this.candlesCurrent[id];
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

  async subscribe(subscription: cpz.Exwatcher) {
    if (subscription) {
      const { id, status } = subscription;
      if (status !== cpz.ExwatcherStatus.subscribed) {
        try {
          this.candlesCurrent[id] = {};
          await this.subscribeCCXT(id);

          this.subscriptions[id].status = cpz.ExwatcherStatus.subscribed;
          this.subscriptions[id].error = null;
          this.logger.info(`Subscribed ${id}`);

          await this.saveSubscription(this.subscriptions[id]);
        } catch (e) {
          this.logger.error(e);
          this.subscriptions[id].status = cpz.ExwatcherStatus.failed;
          this.subscriptions[id].error = e.message;
          await this.saveSubscription(this.subscriptions[id]);
        }
      }
    }
  }

  getSymbol(asset: string, currency: string): string {
    return `${asset}/${currency}`;
  }

  async subscribeCCXT(id: string) {
    const symbol = this.getSymbol(
      this.subscriptions[id].asset,
      this.subscriptions[id].currency
    );
    /*  if (this.connector.has["watchOHLCV"]) {
      for (const timeframe of Timeframe.validArray) {
        await this.connector.watchOHLCV(
          symbol,
          Timeframe.timeframes[timeframe].str
        );
      }
    } else*/
    if (this.connector.has["watchTrades"]) {
      await this.connector.watchTrades(symbol);
      for (const timeframe of Timeframe.validArray) {
        await this.connector.watchOHLCV(
          symbol,
          Timeframe.timeframes[timeframe].str
        );
      }
      await this.loadCurrentCandles(this.subscriptions[id]);
    } else {
      throw new Error("Exchange is not supported");
    }
  }

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

  async loadCurrentCandles(subscription: cpz.Exwatcher): Promise<void> {
    const { id, exchange, asset, currency } = subscription;
    this.logger.info(`Loading current candles ${id}`);
    if (!this.candlesCurrent[id]) this.candlesCurrent[id] = {};
    await Promise.all(
      Timeframe.validArray.map(async timeframe => {
        const candle: cpz.Candle = await this.broker.call(
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
          id: uuid()
        };
        await this.saveCurrentCandles([this.candlesCurrent[id][timeframe]]);
      })
    );
  }

  async publishTick(tick: cpz.ExchangePrice): Promise<void> {
    this.logger.info("New tick", tick);
    await this.broker.emit(cpz.Event.TICK_NEW, tick);
  }

  async saveSubscription(subscription: cpz.Exwatcher): Promise<void> {
    await this.broker.call(`${cpz.Service.DB_EXWATCHERS}.upsert`, {
      entity: subscription
    });
  }

  async deleteSubscription(id: string): Promise<void> {
    await this.broker.call(`${cpz.Service.DB_EXWATCHERS}.remove`, {
      id
    });
  }

  async handleTrades(): Promise<void> {
    try {
      // Текущие дата и время - минус одна секунда
      const date = dayjs.utc().startOf("second");
      this.logger.info(date.toISOString());
      // Есть ли подходящие по времени таймфреймы
      const currentTimeframes = Timeframe.timeframesByDate(date.toISOString());
      let closedCandles: { [key: string]: cpz.Candle[] } = {};

      await Promise.all(
        this.activeSubscriptions.map(
          async ({ id, asset, currency }: cpz.Exwatcher) => {
            const symbol = this.getSymbol(asset, currency);
            if (this.connector.trades[symbol]) {
              // Запрашиваем все прошедшие трейды
              const trades: Trade[] = this.connector.trades[symbol].filter(
                ({ timestamp }: Trade) =>
                  timestamp < date.valueOf() &&
                  (!this.lastDate || timestamp >= this.lastDate)
              );
              this.logger.info(
                `con trades ${this.connector.trades[symbol].length} trades ${trades.length}`
              );
              this.lastDate = date.valueOf();
              // Если были трейды
              if (trades.length > 0) {
                // Если было изменение цены
                let tick: cpz.ExchangePrice;
                if (this.lastTick[id]) {
                  const prices = trades
                    .filter(
                      ({ timestamp }: Trade) =>
                        timestamp > this.lastTick[id].time
                    )
                    .map(t => t.price);
                  if (
                    prices.length > 0 &&
                    prices.some(d => d !== this.lastTick[id].price)
                  ) {
                    const { timestamp, price } = trades[trades.length - 1];
                    tick = {
                      exchange: this.exchange,
                      asset,
                      currency,
                      time: timestamp,
                      timestamp: dayjs.utc(timestamp).toISOString(),
                      price
                    };
                    this.lastTick[id] = tick;
                  }
                } else {
                  const { timestamp, price } = trades[trades.length - 1];
                  tick = {
                    exchange: this.exchange,
                    asset,
                    currency,
                    time: timestamp,
                    timestamp: dayjs.utc(timestamp).toISOString(),
                    price
                  };
                  this.lastTick[id] = tick;
                }
                const currentCandles: cpz.Candle[] = [];
                Timeframe.validArray.forEach(async timeframe => {
                  if (trades.length > 0) {
                    const prices = trades.map(t => +t.price);
                    if (this.candlesCurrent[id][timeframe].volume === 0)
                      this.candlesCurrent[id][timeframe].open = round(
                        +trades[0].price,
                        2
                      );
                    this.candlesCurrent[id][timeframe].high = Math.max(
                      this.candlesCurrent[id][timeframe].high,
                      ...prices
                    );
                    this.candlesCurrent[id][timeframe].low = Math.min(
                      this.candlesCurrent[id][timeframe].low,
                      ...prices
                    );
                    this.candlesCurrent[id][timeframe].close = +trades[
                      trades.length - 1
                    ].price;
                    this.candlesCurrent[id][timeframe].volume =
                      round(
                        this.candlesCurrent[id][timeframe].volume +
                          +trades.map(t => t.amount).reduce((a, b) => a + b, 0),
                        3
                      ) || this.candlesCurrent[id][timeframe].volume + 0;
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

                if (tick) {
                  await this.publishTick(tick);
                }
              }
            }
          }
        )
      );

      if (currentTimeframes.length > 0) {
        // Сброс текущих свечей
        currentTimeframes.forEach(timeframe => {
          closedCandles[timeframe] = [];
          this.activeSubscriptions.forEach(
            ({ id, asset, currency }: cpz.Exwatcher) => {
              const dateFrom = Timeframe.getCurrentSince(1, timeframe);
              const logTrades = this.connector.trades[
                this.getSymbol(asset, currency)
              ].map(
                (t: { datetime: string; price: number }) =>
                  `${t.datetime} ${t.price}`
              );
              for (const trade of logTrades) {
                this.logger.info(trade);
              }
              this.logger.info(
                "ohlcv",
                this.connector.ohlcvs[this.getSymbol(asset, currency)][
                  Timeframe.get(timeframe).str
                ].map((candle: any) => ({
                  time: +candle[0],
                  timestamp: new Date(+candle[0]).toISOString(),
                  open: +candle[1],
                  high: +candle[2],
                  low: +candle[3],
                  close: +candle[4],
                  volume: +candle[5] || 0
                }))
              );
              if (
                this.candlesCurrent[id] &&
                this.candlesCurrent[id][timeframe]
              ) {
                closedCandles[timeframe].push({
                  ...this.candlesCurrent[id][timeframe]
                });
                this.candlesCurrent[id][timeframe].id = uuid();
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
                this.candlesCurrent[id][timeframe].type =
                  cpz.CandleType.previous;
              }
            }
          );
        });
      }

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

              await Promise.all(
                candles.map(async candle => {
                  this.logger.info(candle);
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

  async saveCurrentCandles(candles: cpz.Candle[]): Promise<void> {
    try {
      await this.broker.mcall(
        candles.map(candle => ({
          action: `${cpz.Service.DB_CANDLES}${candle.timeframe}.upsert`,
          params: {
            entities: [candle]
          }
        }))
      );
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = BinanceFuturesWatcherService;

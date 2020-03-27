import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../@types";
import { v4 as uuid } from "uuid";
import dayjs from "../lib/dayjs";
import ccxtpro from "ccxt.pro";
import cron from "node-cron";
import Timeframe from "../utils/timeframe";
import RedisLock from "./redislock";
import { uniqueElementsBy, round } from "../utils/helpers";
import { createFetchMethod } from "../utils/fetch";

interface Trade {
  amount: number; // amount of base currency
  price: number; // float price in quote currency
  timestamp: number; // Unix timestamp in milliseconds
}
class BaseExwatcher extends Service {
  constructor(exchange: string, broker: ServiceBroker) {
    super(broker);
    this.exchange = exchange;
    this.parseServiceSchema({
      name: `${this.exchange}-watcher`,
      dependencies: [
        cpz.Service.PUBLIC_CONNECTOR,
        cpz.Service.DB_EXWATCHERS,
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
        },
        unsubscribe: {
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
            return this.removeSubscription(
              ctx.params.asset,
              ctx.params.currency
            );
          }
        },
        unsubscribeAll: {
          async handler(ctx: Context) {
            return this.unsubscribeAll();
          }
        }
      },
      started: this.startedService,
      stopped: this.stoppedService
    });
  }
  exchange: string;
  subscriptions: { [key: string]: cpz.Exwatcher } = {};
  candlesCurrent: { [key: string]: { [key: string]: cpz.Candle } } = {};
  lastTick: { [key: string]: cpz.ExchangePrice } = {};

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
    if (this.exchange === "binance_futures") {
      this.connector = new ccxtpro.binance({
        fetchImplementation: createFetchMethod(process.env.PROXY_ENDPOINT),
        options: { defaultType: "future", OHLCVLimit: 100 }
      });
      this.cronHandleChanges = cron.schedule(
        "* * * * * *",
        this.handleCandles.bind(this),
        {
          scheduled: false
        }
      );
    } else if (this.exchange === "bitfinex") {
      this.connector = new ccxtpro.bitfinex({
        fetchImplementation: createFetchMethod(process.env.PROXY_ENDPOINT)
      });
      this.cronHandleChanges = cron.schedule(
        "* * * * * *",
        this.handleTrades.bind(this),
        {
          scheduled: false
        }
      );
    } else if (this.exchange === "kraken") {
      this.connector = new ccxtpro.kraken({
        fetchImplementation: createFetchMethod(process.env.PROXY_ENDPOINT)
      });
      this.cronHandleChanges = cron.schedule(
        "* * * * * *",
        this.handleTrades.bind(this),
        {
          scheduled: false
        }
      );
    } else throw new Error("Unsupported exchange");

    await this.resubscribe();
    this.cronHandleChanges.start();
    this.cronCheck.start();
  }

  async stoppedService() {
    this.cronHandleChanges.stop();
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

    const subscription = Object.values(this.subscriptions).find(
      (sub: cpz.Exwatcher) => sub.importerId === importerId
    );
    if (subscription) {
      this.logger.info(`Importer ${importerId} finished!`);
      await this.subscribe(subscription);
    }
  }

  async handleImporterFailedEvent(
    ctx: Context<{
      id: string;
      error: any;
    }>
  ) {
    const { id: importerId, error } = ctx.params;
    const subscription = Object.values(this.subscriptions).find(
      (sub: cpz.Exwatcher) => sub.importerId === importerId
    );

    if (subscription && subscription.id) {
      this.logger.warn(`Importer ${importerId} failed!`, error);
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
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
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
    exchange: string;
    asset: string;
    currency: string;
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
        success: true,
        exchange: this.exchange,
        asset,
        currency
      };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e.message,
        exchange: this.exchange,
        asset,
        currency
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
    if (this.exchange === "binance_futures") {
      for (const timeframe of Timeframe.validArray) {
        await this.connector.watchOHLCV(
          symbol,
          Timeframe.timeframes[timeframe].str
        );
      }
    } else if (this.exchange === "bitfinex" || this.exchange === "kraken") {
      await this.connector.watchTrades(symbol);
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

  async handleCandles(): Promise<void> {
    try {
      // Текущие дата и время - минус одна секунда
      const date = dayjs
        .utc()
        .add(-1, cpz.TimeUnit.second)
        .startOf(cpz.TimeUnit.second);
      // Есть ли подходящие по времени таймфреймы
      const currentTimeframes = Timeframe.timeframesByDate(date.toISOString());
      const closedCandles: { [key: string]: cpz.Candle[] } = {};

      await Promise.all(
        this.activeSubscriptions.map(
          async ({ id, asset, currency }: cpz.Exwatcher) => {
            const symbol = this.getSymbol(asset, currency);

            const currentCandles: cpz.Candle[] = [];
            Timeframe.validArray.forEach(async timeframe => {
              const candles: [
                number,
                number,
                number,
                number,
                number,
                number
              ][] = this.connector.ohlcvs[symbol][
                Timeframe.get(timeframe).str
              ].filter((c: any) => c[0] < date.valueOf());

              if (candles.length > 0) {
                const candle = candles[candles.length - 1];
                if (this.candlesCurrent[id][timeframe]) {
                  this.candlesCurrent[id][timeframe].open = candle[1];
                  this.candlesCurrent[id][timeframe].high = candle[2];
                  this.candlesCurrent[id][timeframe].low = candle[3];
                  this.candlesCurrent[id][timeframe].close = candle[4];
                  this.candlesCurrent[id][timeframe].volume = candle[5];
                  this.candlesCurrent[id][timeframe].type =
                    this.candlesCurrent[id][timeframe].volume === 0
                      ? cpz.CandleType.previous
                      : cpz.CandleType.loaded;
                } else {
                  this.candlesCurrent[id][timeframe] = {
                    id: uuid(),
                    exchange: this.exchange,
                    asset,
                    currency,
                    timeframe,
                    time: candle[0],
                    timestamp: dayjs.utc(candle[0]).toISOString(),
                    open: candle[1],
                    high: candle[2],
                    low: candle[3],
                    close: candle[4],
                    volume: candle[5],
                    type:
                      candle[5] === 0
                        ? cpz.CandleType.previous
                        : cpz.CandleType.loaded
                  };
                }

                currentCandles.push(this.candlesCurrent[id][timeframe]);
              }
            });

            if (currentCandles.length > 0) {
              await this.saveCurrentCandles(currentCandles);
            }

            let tick: cpz.ExchangePrice;
            if (
              this.candlesCurrent[id][1440] &&
              this.lastTick[id] &&
              this.candlesCurrent[id][1440].close !== this.lastTick[id].price
            ) {
              const { time, timestamp, close } = this.candlesCurrent[id][1440];
              tick = {
                exchange: this.exchange,
                asset,
                currency,
                time,
                timestamp,
                price: close
              };
              this.lastTick[id] = tick;
            } else {
              if (this.candlesCurrent[id][1440]) {
                const { time, timestamp, close } = this.candlesCurrent[
                  id
                ][1440];
                tick = {
                  exchange: this.exchange,
                  asset,
                  currency,
                  time,
                  timestamp,
                  price: close
                };
                this.lastTick[id] = tick;
              }
            }

            if (tick) {
              await this.publishTick(tick);
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
              const symbol = this.getSymbol(asset, currency);
              if (
                this.candlesCurrent[id] &&
                this.candlesCurrent[id][timeframe]
              ) {
                closedCandles[timeframe].push({
                  ...this.candlesCurrent[id][timeframe]
                });
                this.candlesCurrent[id][timeframe].id = uuid();
                this.candlesCurrent[id][timeframe].time = date
                  .startOf(cpz.TimeUnit.minute)
                  .valueOf();
                this.candlesCurrent[id][timeframe].timestamp = date
                  .startOf(cpz.TimeUnit.minute)
                  .toISOString();

                const candle: [
                  number,
                  number,
                  number,
                  number,
                  number,
                  number
                ] = this.connector.ohlcvs[symbol][Timeframe.get(timeframe).str][
                  this.connector.ohlcvs[symbol][Timeframe.get(timeframe).str]
                    .length - 1
                ];
                if (candle[0] === date.valueOf()) {
                  this.candlesCurrent[id][timeframe].open = candle[1];
                  this.candlesCurrent[id][timeframe].high = candle[2];
                  this.candlesCurrent[id][timeframe].low = candle[3];
                  this.candlesCurrent[id][timeframe].close = candle[4];
                  this.candlesCurrent[id][timeframe].volume = candle[5];
                } else {
                  this.candlesCurrent[id][timeframe].open = candle[4];
                  this.candlesCurrent[id][timeframe].high = candle[4];
                  this.candlesCurrent[id][timeframe].low = candle[4];
                  this.candlesCurrent[id][timeframe].close = candle[4];
                  this.candlesCurrent[id][timeframe].volume = 0;
                }
                this.candlesCurrent[id][timeframe].type =
                  this.candlesCurrent[id][timeframe].volume === 0
                    ? cpz.CandleType.previous
                    : cpz.CandleType.loaded;
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
                  if (candle.type !== cpz.CandleType.previous)
                    await this.broker.emit(cpz.Event.CANDLE_NEW, candle);
                })
              );
            }
          })
        );
      }

      this.lastDate = date.valueOf();
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleTrades(): Promise<void> {
    try {
      // Текущие дата и время - минус одна секунда
      const date = dayjs
        .utc()
        .add(-1, cpz.TimeUnit.second)
        .startOf(cpz.TimeUnit.second);
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
          this.activeSubscriptions.forEach(({ id }: cpz.Exwatcher) => {
            if (this.candlesCurrent[id] && this.candlesCurrent[id][timeframe]) {
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
              this.candlesCurrent[id][timeframe].type = cpz.CandleType.previous;
            }
          });
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
                  if (candle.type !== cpz.CandleType.previous)
                    await this.broker.emit(cpz.Event.CANDLE_NEW, candle);
                })
              );
            }
          })
        );
      }

      this.lastDate = date.valueOf();
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

export = BaseExwatcher;

import { Service, ServiceBroker, Context, Errors } from "moleculer";
import QueueService from "moleculer-bull";
import { v4 as uuid } from "uuid";
import { Job } from "bull";
import dayjs from "../../lib/dayjs";
import {
  sortAsc,
  chunkDates,
  loadLimit,
  getValidDate,
  chunkArray,
  round
} from "../../utils";
import { cpz } from "../../@types";
import Timeframe from "../../utils/timeframe";
import { CANDLES_RECENT_AMOUNT } from "../../config";
import { spawn, Pool, Worker } from "threads";
import { ImporterUtils } from "../../workers/importer";

class ImporterWorkerService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.IMPORTER_WORKER,
      mixins: [
        QueueService({
          redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS && {}
          },
          settings: {
            lockDuration: 120000,
            lockRenewTime: 10000,
            stalledInterval: 120000,
            maxStalledCount: 1
          }
        })
      ],
      dependencies: [
        cpz.Service.PUBLIC_CONNECTOR,
        cpz.Service.DB_IMPORTERS,
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
      started: this.startedService,
      stopped: this.stoppedService,
      queues: {
        [cpz.Queue.importCandles]: {
          concurrency: 3,
          async process(job: Job) {
            this.logger.info(
              `Job #${job.id} start importing ${job.data.exchange}-${job.data.asset}-${job.data.currency} ${job.data.type} candles`
            );
            const state: cpz.Importer = {
              ...job.data,
              status: cpz.Status.started,
              startedAt: dayjs.utc().toISOString(),
              endedAt: null,
              error: null,
              progress: 0
            };
            try {
              const currentState: cpz.Importer = await this.broker.call(
                `${cpz.Service.DB_IMPORTERS}.get`,
                { id: state.id }
              );
              if (currentState.status === cpz.Status.finished)
                return {
                  success: true,
                  state: currentState
                };
              await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
                entity: state
              });
              if (state.type === "recent") {
                await this.importerRecent(job, state);
              } else if (state.type === "history") {
                await this.importerHistory(job, state);
              }
              state.endedAt = dayjs.utc().toISOString();
              state.status = cpz.Status.finished;
              state.progress = 100;
              await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
                entity: state
              });
              this.broker.broadcast(cpz.Event.IMPORTER_FINISHED, {
                id: state.id
              });
              this.logger.info(`Job #${job.id} finished`);
              return {
                success: true,
                state
              };
            } catch (e) {
              this.logger.error(e);
              this.broker.broadcast(cpz.Event.IMPORTER_FAILED, {
                id: job.id,
                error: e.message
              });
              state.status = cpz.Status.failed;
              state.error = e.message;
              await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
                entity: state
              });
              if (e instanceof Errors.ValidationError) {
                return {
                  success: false,
                  state: { id: job.id, error: e.message }
                };
              }
              throw new Errors.MoleculerError(
                `Failed to import candles jobId: ${job.id}`,
                500,
                this.name,
                { ...job.data }
              );
            }
          }
        }
      }
    });
  }

  async startedService() {
    this.pool = Pool(
      () => spawn<ImporterUtils>(new Worker("../../workers/importer")),
      {
        concurrency: 2,
        name: "importer"
      }
    );
  }

  async stoppedService() {
    this.pool.terminate(true);
  }

  async uniqueCandles(
    arr: cpz.Candle[],
    dateStart: string,
    dateStop: string
  ): Promise<cpz.Candle[]> {
    return this.pool.queue(async (utils: ImporterUtils) =>
      utils.uniqueCandles(arr, dateStart, dateStop)
    );
  }

  async uniqueTrades(
    trades: cpz.ExchangeTrade[],
    dateFrom: string,
    dateTo: string
  ): Promise<cpz.ExchangeTrade[]> {
    return this.pool.queue(async (utils: ImporterUtils) =>
      utils.uniqueTrades(trades, dateFrom, dateTo)
    );
  }

  async createCandlesFromTrades(
    dateFrom: string,
    dateTo: string,
    timeframes: cpz.Timeframe[],
    trades: cpz.ExchangeTrade[]
  ): Promise<cpz.ExchangeCandlesInTimeframes> {
    return this.pool.queue(async (utils: ImporterUtils) =>
      utils.createCandlesFromTrades(dateFrom, dateTo, timeframes, trades)
    );
  }

  async handleCandleGaps(
    dateFromInput: string,
    dateTo: string,
    inputCandles: cpz.ExchangeCandle[]
  ): Promise<cpz.ExchangeCandle[]> {
    return this.pool.queue(async (utils: ImporterUtils) =>
      utils.handleCandleGaps(dateFromInput, dateTo, inputCandles)
    );
  }

  async importerRecent(job: Job, state: cpz.Importer) {
    try {
      const {
        id,
        exchange,
        asset,
        currency,
        params: {
          timeframes = Timeframe.validArray,
          amount = CANDLES_RECENT_AMOUNT
        }
      } = state;
      let candlesInTimeframes: cpz.ExchangeCandlesInTimeframes = null;

      candlesInTimeframes = await this.importCandles({
        exchange,
        asset,
        currency,
        timeframes,
        amount
      });
      this.logger.info(`Job #${id} loaded and handled candles`);
      await job.progress(75);
      await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
        entity: { ...state, progress: 75 }
      });
      if (!candlesInTimeframes) throw new Error("Failed to import candles");

      await this.saveCandles(candlesInTimeframes);
      this.logger.info(`Job #${id} saved candles to db`);
      await job.progress(100);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async importerHistory(job: Job, state: cpz.Importer) {
    try {
      const {
        id,
        exchange,
        asset,
        currency,
        params: {
          timeframes = Timeframe.validArray,
          dateFrom: paramsDateFrom,
          dateTo: paramsDateTo
        }
      } = state;
      const dateTo = getValidDate(paramsDateTo);

      if (exchange === "kraken") {
        const { chunks } = chunkDates(
          paramsDateFrom,
          dateTo,
          cpz.TimeUnit.day,
          1,
          1
        );
        const total = chunks.length;
        let prevPercent = 0;
        let percent = 0;
        let processed = 0;
        for (const { dateFrom: loadDateFrom, dateTo: loadDateTo } of chunks) {
          this.logger.info(
            `Job #${id} loading from ${loadDateFrom} to ${loadDateTo}`
          );
          const trades = await this.importTrades({
            exchange,
            asset,
            currency,
            dateFrom: dayjs
              .utc(loadDateFrom)
              .add(-1, cpz.TimeUnit.hour)
              .toISOString(),
            dateTo: loadDateTo
          });
          const candlesInTimeframes = await this.createCandlesFromTrades(
            loadDateFrom,
            loadDateTo,
            timeframes,
            trades
          );
          if (candlesInTimeframes) {
            for (const timeframe of Object.keys(candlesInTimeframes)) {
              candlesInTimeframes[+timeframe] = await this.handleCandleGaps(
                paramsDateFrom,
                dateTo,
                candlesInTimeframes[+timeframe]
              );
            }
            await this.saveCandles(candlesInTimeframes);
          }
          processed += 1;
          percent = round((processed / total) * 100);
          if (percent > prevPercent) {
            prevPercent = percent;
            await job.progress(percent);
            await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
              entity: { ...state, progress: percent }
            });
          }
        }
      } else {
        const { chunks } = chunkDates(
          paramsDateFrom,
          dateTo,
          cpz.TimeUnit.day,
          1,
          1
        );
        const total = chunks.length;
        let prevPercent = 0;
        let percent = 0;
        let processed = 0;
        for (const { dateFrom: loadDateFrom, dateTo: loadDateTo } of chunks) {
          this.logger.info(
            `Job #${id} loading from ${loadDateFrom} to ${loadDateTo}`
          );
          const candlesInTimeframes = await this.importCandles({
            exchange,
            asset,
            currency,
            timeframes,
            dateFrom: loadDateFrom,
            dateTo: loadDateTo
          });
          await this.saveCandles(candlesInTimeframes);
          processed += 1;
          percent = round((processed / total) * 100);
          if (percent > prevPercent) {
            prevPercent = percent;
            await job.progress(percent);
            await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
              entity: { ...state, progress: percent }
            });
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * Import candles
   *
   * @param {{
   *       exchange: string;
   *       asset: string;
   *       currency: string;
   *       timeframes: cpz.Timeframe[];
   *       dateFrom?: string;
   *       dateTo?: string;
   *       amount?: number;
   *     }} {
   *       exchange,
   *       asset,
   *       currency,
   *       timeframes,
   *       dateFrom,
   *       dateTo,
   *       amount
   *     }
   * @returns {Promise<void>}
   */
  async importCandles({
    exchange,
    asset,
    currency,
    timeframes,
    dateFrom,
    dateTo = dayjs
      .utc()
      .startOf(cpz.TimeUnit.minute)
      .toISOString(),
    amount
  }: {
    exchange: string;
    asset: string;
    currency: string;
    timeframes: cpz.Timeframe[];
    dateFrom?: string;
    dateTo?: string;
    amount?: number;
  }): Promise<cpz.ExchangeCandlesInTimeframes> {
    const result: cpz.ExchangeCandlesInTimeframes = {};
    await Promise.all(
      timeframes.map(async (timeframe: cpz.Timeframe) => {
        result[timeframe] = [];
        const slug = `${exchange}.${asset}.${currency}.${timeframe}`;
        const { unit, amountInUnit } = Timeframe.get(timeframe);
        const limit =
          amount && loadLimit(exchange) > amount ? amount : loadLimit(exchange);

        let dateStart =
          dateFrom && Timeframe.validTimeframeDateNext(dateFrom, timeframe);
        let dateStop = dayjs
          .utc(Timeframe.validTimeframeDateNext(dateTo, timeframe))
          .add(-amountInUnit, unit)
          .toISOString();

        if (!dateStart && amount) {
          dateStart = dayjs
            .utc(dateStop)
            .add(-amountInUnit * amount, unit)
            .startOf(unit)
            .toISOString();
        }

        const { chunks } = chunkDates(
          dateStart,
          dateStop,
          unit,
          amountInUnit,
          limit / amountInUnit
        );

        const loadResults = await Promise.all(
          chunks.map(async ({ dateFrom: loadFrom }) => {
            let candles: any[];
            try {
              candles = await this.broker.call(
                `${cpz.Service.PUBLIC_CONNECTOR}.getCandles`,
                {
                  exchange,
                  asset,
                  currency,
                  timeframe,
                  dateFrom: loadFrom,
                  limit
                },
                {
                  retries: 20
                }
              );
            } catch (e) {
              this.logger.error(e);
              throw e;
            }

            if (!candles || !Array.isArray(candles) || candles.length === 0) {
              this.logger.warn(`${slug} ${loadFrom} empty response!`);
              return [];
            } else {
              return candles;
            }
          })
        );
        result[timeframe] = await this.uniqueCandles(
          [].concat(...loadResults),
          dateStart,
          dateStop
        );
      })
    );
    return result;
  }

  /**
   * Import Trades
   *
   * @param {{
   *       exchange: string;
   *       asset: string;
   *       currency: string;
   *       dateFrom: string;
   *       dateTo: string;
   *     }} {
   *       exchange,
   *       asset,
   *       currency,
   *       dateFrom,
   *       dateTo
   *     }
   * @returns {Promise<cpz.ExchangeTrade[]>}
   */
  async importTrades({
    exchange,
    asset,
    currency,
    dateFrom,
    dateTo
  }: {
    exchange: string;
    asset: string;
    currency: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<cpz.ExchangeTrade[]> {
    const { chunks } = chunkDates(dateFrom, dateTo, cpz.TimeUnit.hour, 6, 1);

    const loadedChunks = await Promise.all(
      chunks.map(async ({ dateFrom: loadDateFrom, dateTo: loadDateTo }) => {
        let loadedTrades: cpz.ExchangeTrade[] = [];
        let dateNext = dayjs.utc(loadDateFrom);
        while (dateNext.valueOf() <= dayjs.utc(loadDateTo).valueOf()) {
          try {
            const response: cpz.ExchangeTrade[] = await this.broker.call(
              `${cpz.Service.PUBLIC_CONNECTOR}.getTrades`,
              {
                exchange,
                asset,
                currency,
                dateFrom: dateNext.toISOString()
              },
              {
                retries: 20
              }
            );
            if (!response || !Array.isArray(response))
              throw new Error("Wrong connector response");
            dateNext = dayjs.utc(loadDateTo);
            if (response.length > 0) {
              loadedTrades = await this.uniqueTrades(
                [...loadedTrades, ...response],
                dateFrom,
                dateTo
              );

              dateNext = dayjs.utc(response[response.length - 1].timestamp);
            }
          } catch (e) {
            this.logger.error(e);
            return [];
          }
        }
        return loadedTrades;
      })
    );

    const trades: cpz.ExchangeTrade[] = []
      .concat(...loadedChunks)
      .sort((a, b) => sortAsc(a.time, b.time));

    return trades;
  }

  async saveCandles(
    candlesInTimeframes: cpz.ExchangeCandlesInTimeframes
  ): Promise<void> {
    try {
      await Promise.all(
        Object.keys(candlesInTimeframes).map(async (timeframe: string) => {
          try {
            if (candlesInTimeframes[+timeframe].length > 0) {
              const chunks = chunkArray(candlesInTimeframes[+timeframe], 500);
              for (const chunk of chunks) {
                try {
                  await this.broker.call(
                    `${cpz.Service.DB_CANDLES}${timeframe}.upsert`,
                    {
                      entities: chunk.map(candle => ({
                        id: uuid(),
                        ...candle
                      }))
                    }
                  );
                } catch (e) {
                  this.logger.error(e);
                  throw e;
                }
              }
            }
          } catch (e) {
            this.logger.error(e);
            throw e;
          }
        })
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = ImporterWorkerService;

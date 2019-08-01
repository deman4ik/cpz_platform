import { ServiceSchema, Errors, Logger } from "moleculer";
import QueueService from "moleculer-bull";
import { v4 as uuid } from "uuid";
import { Job } from "bull";
import dayjs from "../../lib/dayjs";
import {
  sortAsc,
  chunkDates,
  loadLimit,
  getValidDate,
  handleCandleGaps,
  createCandlesFromTrades,
  chunkArray,
  uniqueElementsBy
} from "../../utils";
import { cpz } from "../../types/cpz";
import Timeframe from "../../utils/timeframe";
import { stat } from "fs";

const ImporterWorkerService: ServiceSchema = {
  name: cpz.Service.IMPORTER_WORKER,
  mixins: [
    QueueService(process.env.REDIS_URL, {
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
    `${cpz.Service.DB_CANDLES}1440`
  ],
  queues: {
    [cpz.Queue.importCandles]: [
      {
        async process(job: Job) {
          try {
            this.logger.info(`Importing candles id: ${job.id}`, job.data);
            const state: cpz.Importer = {
              ...job.data,
              status: cpz.Status.started,
              startedAt: dayjs.utc().toISOString(),
              endedAt: null,
              error: null
            };
            const currentState = await this.broker.call(
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
            if (state.type === "current") {
              await this.importerCurrent(job, state);
            } else if (state.type === "history") {
              await this.importerHistory(job, state);
            }
            state.endedAt = dayjs.utc().toISOString();
            state.status = cpz.Status.finished;
            await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
              entity: state
            });
            this.broker.emit(cpz.Event.IMPORTER_FINISHED, { id: state.id });
            this.logger.info(`Finished importing candles id: ${job.id}`);
            return {
              success: true,
              state
            };
          } catch (e) {
            this.logger.error(e);
            if (e instanceof Errors.ValidationError) {
              return {
                success: false,
                state: { id: job.id, error: e }
              };
            }
            throw new Errors.MoleculerError(
              `Failed to import current candles jobId: ${job.id}`,
              500,
              this.name,
              { ...job.data }
            );
          }
        }
      }
    ]
  },
  methods: {
    async importerCurrent(job, state) {
      try {
        const {
          id,
          exchange,
          asset,
          currency,
          params: { timeframes, amount }
        } = state;
        let candlesInTimeframes: cpz.ExchangeCandlesInTimeframes = null;

        if (exchange === "kraken") {
          const currentDate = dayjs.utc();
          const loadTimeframes: {
            trades: { [key: number]: { dateFrom: string } };
            candles: cpz.ValidTimeframe[];
          } = {
            trades: [],
            candles: []
          };
          timeframes.forEach((timeframe: cpz.ValidTimeframe) => {
            const { unit, amountInUnit } = Timeframe.get(timeframe);
            const dateFrom = currentDate.add(-amount * amountInUnit, unit);
            if (
              (timeframe === cpz.Timeframe["1m"] &&
                currentDate.diff(dateFrom, cpz.TimeUnit.hour) > 10) ||
              (timeframe === cpz.Timeframe["5m"] &&
                currentDate.diff(dateFrom, cpz.TimeUnit.day) > 1) ||
              (timeframe === cpz.Timeframe["15m"] &&
                currentDate.diff(dateFrom, cpz.TimeUnit.day) > 6) ||
              (timeframe === cpz.Timeframe["30m"] &&
                currentDate.diff(dateFrom, cpz.TimeUnit.day) > 13) ||
              ((timeframe === cpz.Timeframe["1h"] ||
                timeframe === cpz.Timeframe["2h"]) &&
                currentDate.diff(dateFrom, cpz.TimeUnit.day) > 28) ||
              (timeframe === cpz.Timeframe["4h"] &&
                currentDate.diff(dateFrom, cpz.TimeUnit.day) > 110) ||
              (timeframe === cpz.Timeframe["1d"] &&
                currentDate.diff(dateFrom, cpz.TimeUnit.day) > 710)
            ) {
              loadTimeframes.trades[timeframe] = {
                dateFrom: dateFrom.toISOString()
              };
            } else loadTimeframes.candles.push(timeframe);
          });
          if (loadTimeframes.candles.length > 0) {
            candlesInTimeframes = await this.importCandles({
              exchange,
              asset,
              currency,
              timeframes: loadTimeframes.candles,
              amount
            });
            this.logger.info(`Loaded and handled candles id: ${id}`);
          }

          if (Object.keys(loadTimeframes.trades).length > 0) {
            const tradesTimeframes = Object.keys(loadTimeframes.trades).map(
              timeframe => +timeframe
            );
            const maxTimeframe = Math.max(...tradesTimeframes);
            const {
              unit: maxTimeframeUnit,
              amountInUnit: maxTimeframeAmountInUnit
            } = Timeframe.get(maxTimeframe);
            const dateFrom = currentDate
              .add(-((amount + 1) * maxTimeframeAmountInUnit), maxTimeframeUnit)
              .toISOString();
            const trades = await this.importTrades({
              exchange,
              asset,
              currency,
              dateFrom,
              dateTo: currentDate.toISOString()
            });
            this.logger.info(`Loaded ${trades.length} id: ${id}`);
            await job.progress(25);
            const candlesFromTradesInTimeframes = createCandlesFromTrades(
              dateFrom,
              currentDate.toISOString(),
              tradesTimeframes,
              trades
            );
            this.logger.info(`Created candles from trades id: ${id}`);
            await job.progress(50);

            await Promise.all(
              Object.keys(candlesFromTradesInTimeframes).map(
                async (timeframe: string) => {
                  candlesInTimeframes[+timeframe] = await handleCandleGaps(
                    loadTimeframes.trades[+timeframe].dateFrom,
                    currentDate.toISOString(),
                    candlesInTimeframes[+timeframe]
                  );
                }
              )
            );
            this.logger.info(`Handled candle gaps id: ${id}`);
          }
        } else {
          candlesInTimeframes = await this.importCandles({
            exchange,
            asset,
            currency,
            timeframes,
            amount
          });
          this.logger.info(`Loaded and handled candles id: ${id}`);
        }
        await job.progress(75);
        if (!candlesInTimeframes) throw new Error("Failed to import candles");

        await this.saveCandles(candlesInTimeframes);
        this.logger.info(`Saved candles to db id: ${id}`);
        await job.progress(100);
      } catch (e) {
        this.logger.error(e);
        throw e;
      }
    },
    async importerHistory(job, state) {
      try {
        const {
          id,
          exchange,
          asset,
          currency,
          params: { timeframes, dateFrom: paramsDateFrom, dateTo: paramsDateTo }
        } = state;
        const dateTo = getValidDate(paramsDateTo);

        let candlesInTimeframes: cpz.ExchangeCandlesInTimeframes = null;
        if (exchange === "kraken") {
          const maxTimeframe = Math.max(...timeframes);
          const {
            unit: maxTimeframeUnit,
            amountInUnit: maxTimeframeAmountInUnit
          } = Timeframe.get(maxTimeframe);
          const dateFrom = dayjs
            .utc(paramsDateFrom)
            .add(-maxTimeframeAmountInUnit, maxTimeframeUnit)
            .toISOString();
          const trades = await this.importTrades({
            exchange,
            asset,
            currency,
            dateFrom,
            dateTo
          });
          this.logger.info(`Loaded ${trades.length} id: ${id}`);
          await job.progress(25);

          candlesInTimeframes = await createCandlesFromTrades(
            dateFrom,
            dateTo,
            timeframes,
            trades
          );
          this.logger.info(`Created candles from trades id: ${id}`);
          await job.progress(50);

          await Promise.all(
            Object.keys(candlesInTimeframes).map(async (timeframe: string) => {
              candlesInTimeframes[+timeframe] = await handleCandleGaps(
                paramsDateFrom,
                dateTo,
                candlesInTimeframes[+timeframe]
              );
            })
          );
          this.logger.info(`Handled candle gaps id: ${id}`);
        } else {
          candlesInTimeframes = await this.importCandles({
            exchange,
            asset,
            currency,
            timeframes,
            dateFrom: paramsDateFrom,
            dateTo
          });
          this.logger.info(`Loaded and handled candles id: ${id}`);
        }

        await job.progress(75);
        if (!candlesInTimeframes) throw new Error("Failed to import candles");

        await this.saveCandles(candlesInTimeframes);
        this.logger.info(`Saved candles to db id: ${id}`);
        await job.progress(100);
      } catch (e) {
        this.logger.error(e);
        throw e;
      }
    },
    /**
     * Import candles
     *
     * @param {{
     *       exchange: cpz.ExchangeName;
     *       asset: string;
     *       currency: string;
     *       timeframes: cpz.ValidTimeframe[];
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
      exchange: cpz.ExchangeName;
      asset: string;
      currency: string;
      timeframes: cpz.ValidTimeframe[];
      dateFrom?: string;
      dateTo: string;
      amount?: number;
    }): Promise<cpz.ExchangeCandlesInTimeframes> {
      const result: cpz.ExchangeCandlesInTimeframes = {};
      await Promise.all(
        timeframes.map(async (timeframe: cpz.Timeframe) => {
          result[timeframe] = [];
          const slug = `${exchange}.${asset}.${currency}.${timeframe}`;
          const { unit, amountInUnit } = Timeframe.get(timeframe);
          const limit =
            loadLimit(exchange) > amount ? amount : loadLimit(exchange);

          let dateStart = dateFrom;
          let dateStop = getValidDate(dateTo, unit);

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
              const candles = await this.broker.call(
                `${cpz.Service.PUBLIC_CONNECTOR}.getCandles`,
                {
                  exchange,
                  asset,
                  currency,
                  timeframe,
                  dateFrom: loadFrom,
                  limit
                }
              );

              if (!candles || !Array.isArray(candles) || candles.length === 0) {
                this.logger.error(`${slug} ${loadFrom} empty response!`);
                return [];
              } else {
                return candles;
              }
            })
          );

          result[timeframe] = uniqueElementsBy(
            [].concat(...loadResults),
            (a, b) => a.time === b.time
          )
            .filter(
              candle =>
                candle.time >= dayjs.utc(dateStart).valueOf() &&
                candle.time <= dayjs.utc(dateStop).valueOf()
            )
            .sort((a, b) => sortAsc(a.time, b.time));
        })
      );
      return result;
    },

    /**
     * Import Trades
     *
     * @param {{
     *       exchange: cpz.ExchangeName;
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
      exchange: cpz.ExchangeName;
      asset: string;
      currency: string;
      dateFrom: string;
      dateTo: string;
    }): Promise<cpz.ExchangeTrade[]> {
      const { chunks } = chunkDates(dateFrom, dateTo, cpz.TimeUnit.day, 1, 1);

      const loadedChunks = await Promise.all(
        chunks.map(async ({ dateFrom: loadDateFrom, dateTo: loadDateTo }) => {
          let loadedTrades: cpz.ExchangeTrade[] = [];
          let dateNext = dayjs.utc(loadDateFrom);
          while (dateNext.valueOf() <= dayjs.utc(loadDateTo).valueOf()) {
            try {
              this.logger.info(
                `Loading  ${exchange} ${asset} ${currency} trades ${dateNext.toISOString()}`
              );
              const response = await this.broker.call(
                `${cpz.Service.PUBLIC_CONNECTOR}.getTrades`,
                {
                  exchange,
                  asset,
                  currency,
                  dateFrom: dateNext.toISOString()
                }
              );
              if (!response || !Array.isArray(response))
                throw new Error("Wrong connector response");

              this.logger.info(
                `Loaded trades ${exchange} ${asset} ${currency} ${
                  response.length
                } trades${dateNext.toISOString()}`
              );
              dateNext = dayjs.utc(loadDateTo);
              if (response.length > 0) {
                loadedTrades = uniqueElementsBy(
                  [...loadedTrades, ...response],
                  (a, b) =>
                    a.time === b.time &&
                    a.price === b.price &&
                    a.amount === b.amount &&
                    a.side === b.side
                )
                  .filter(
                    trade =>
                      trade.time >= dayjs.utc(dateFrom).valueOf() &&
                      trade.time <= dayjs.utc(dateTo).valueOf()
                  )
                  .sort((a, b) => sortAsc(a.time, b.time));

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
    },
    async saveCandles(
      candlesInTimeframes: cpz.ExchangeCandlesInTimeframes
    ): Promise<void> {
      try {
        await Promise.all(
          Object.keys(candlesInTimeframes).map(async (timeframe: string) => {
            try {
              if (candlesInTimeframes[+timeframe].length > 0) {
                const { exchange, asset, currency } = candlesInTimeframes[
                  +timeframe
                ][0];
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
};

export = ImporterWorkerService;

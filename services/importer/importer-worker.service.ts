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

const ImporterWorkerService: ServiceSchema = {
  name: cpz.Service.IMPORTER_WORKER,
  mixins: [QueueService()],
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
            this.logger.info(
              `Importing current candles jobId: ${job.id}`,
              job.data
            );
            const state: cpz.Importer = {
              ...job.data,
              status: cpz.Status.started,
              startedAt: dayjs.utc().toISOString(),
              endedAt: null,
              error: null
            };
            await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
              entity: state
            });
            if (state.type === "current") {
              await this.importerCurrent(state);
            } else if (state.type === "history") {
              await this.importerHistory(state);
            }
            state.endedAt = dayjs.utc().toISOString();
            state.status = cpz.Status.finished;
            await this.broker.call(`${cpz.Service.DB_IMPORTERS}.upsert`, {
              entity: state
            });
            return {
              success: true,
              state
            };
          } catch (e) {
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
    async importerCurrent(state) {
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
          if (loadTimeframes.candles.length > 0)
            candlesInTimeframes = await this.importCandles({
              exchange,
              asset,
              currency,
              timeframes: loadTimeframes.candles,
              amount
            });

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

            this.logger.info(
              `${id} creating candles from ${trades.length} trades`
            );
            const candlesFromTradesInTimeframes = createCandlesFromTrades(
              dateFrom,
              currentDate.toISOString(),
              tradesTimeframes,
              trades
            );
            this.logger.info(`${id} handling candle gaps`);
            Object.keys(candlesFromTradesInTimeframes).forEach(
              (timeframe: string) => {
                candlesInTimeframes[+timeframe] = handleCandleGaps(
                  loadTimeframes.trades[+timeframe].dateFrom,
                  currentDate.toISOString(),
                  candlesInTimeframes[+timeframe]
                );
              }
            );
          }
        } else {
          candlesInTimeframes = await this.importCandles({
            exchange,
            asset,
            currency,
            timeframes,
            amount
          });
        }

        if (!candlesInTimeframes) throw new Error("Failed to import candles");

        await this.saveCandles(candlesInTimeframes);
      } catch (e) {
        this.logger.error(e);
        throw e;
      }
    },
    async importerHistory(state) {
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
          this.logger.info(
            `${id} creating candles from ${trades.length} trades`
          );
          candlesInTimeframes = createCandlesFromTrades(
            dateFrom,
            dateTo,
            timeframes,
            trades
          );
          this.logger.info(`${id} handling candle gaps`);
          Object.keys(candlesInTimeframes).forEach((timeframe: string) => {
            candlesInTimeframes[+timeframe] = handleCandleGaps(
              paramsDateFrom,
              dateTo,
              candlesInTimeframes[+timeframe]
            );
          });
        } else {
          candlesInTimeframes = await this.importCandles({
            exchange,
            asset,
            currency,
            timeframes,
            dateFrom: paramsDateFrom,
            dateTo
          });
        }

        if (!candlesInTimeframes) throw new Error("Failed to import candles");

        await this.saveCandles(candlesInTimeframes);
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

          const { chunks, total } = chunkDates(
            dateStart,
            dateStop,
            unit,
            amountInUnit,
            limit / amountInUnit
          );
          this.logger.info(
            `Loading ${total} ${slug} candles from ${dateStart} to ${dateStop} by ${
              chunks.length
            } chunks`
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

              if (!candles || !Array.isArray(candles) || candles.length === 0)
                this.logger.error(`${slug} ${loadFrom} empty response!`);
              else {
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
          this.logger.info(
            `Loaded ${result[timeframe].length} ${slug} candles`
          );
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
      let trades: cpz.ExchangeTrade[] = [];
      let dateNext = dayjs.utc(dateFrom);
      while (dateNext.valueOf() < dayjs.utc(dateTo).valueOf()) {
        this.logger.info(
          `Loading ${exchange}.${asset}.${currency} trades from ${dayjs
            .utc(dateNext)
            .toISOString()}`
        );
        try {
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

          dateNext = dayjs.utc(dateTo);
          if (response.length > 0) {
            trades = uniqueElementsBy(
              [...trades, ...response],
              (a, b) => a.time === b.time
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
          throw e;
        }
      }
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
                const chunks = chunkArray(
                  candlesInTimeframes[+timeframe],
                  1000
                );
                await Promise.all(
                  chunks.map(async chunk => {
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
                  })
                );
                this.logger.info(
                  `Saved ${exchange}.${asset}.${currency}.${timeframe} candles.`
                );
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

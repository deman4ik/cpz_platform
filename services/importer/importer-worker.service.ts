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
  chunkArray
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
        name: cpz.ImportSubQueue.current,
        async process(job: Job) {
          try {
            this.logger.info(
              `Importing current candles jobId: ${job.id}`,
              job.data
            );
            const startedAt = dayjs.utc();
            const { exchange, asset, currency, timeframes, amount } = job.data;

            await this.importCandles({
              exchange,
              asset,
              currency,
              timeframes,
              amount
            });
            const endedAt = dayjs.utc();
            return {
              success: true,
              jobId: job.id,
              startedAt: startedAt.toISOString(),
              endedAt: endedAt.toISOString(),
              duration: endedAt.diff(startedAt, "second")
            };
          } catch (e) {
            if (e instanceof Errors.ValidationError) {
              return {
                success: false,
                jobId: job.id,
                error: e
              };
            }
            throw new Errors.MoleculerError(
              `Failed to import current candles jobId: ${job.id}`,
              500,
              this.name,
              { jobId: job.id, params: job.data }
            );
          }
        }
      },
      {
        name: cpz.ImportSubQueue.history,
        async process(job: Job) {
          try {
            this.logger.info(
              `Importing history candles jobId: ${job.id}`,
              job.data
            );
            const startedAt = dayjs.utc();
            const {
              exchange,
              asset,
              currency,
              timeframes,
              dateFrom,
              dateTo: paramsDateTo
            } = job.data;
            const dateTo = getValidDate(paramsDateTo);

            let candlesInTimeframes: cpz.ExchangeCandlesInTimeframes = null;
            if (exchange === "kraken") {
              const trades = await this.importTrades({
                exchange,
                asset,
                currency,
                dateFrom,
                dateTo
              });
              this.logger.info(
                `${job.id} creating candles from ${trades.length} trades`
              );
              candlesInTimeframes = createCandlesFromTrades(
                dateFrom,
                dateTo,
                timeframes,
                trades
              );
              this.logger.info(`${job.id} handling candle gaps`);
              Object.keys(candlesInTimeframes).forEach((timeframe: string) => {
                candlesInTimeframes[+timeframe] = handleCandleGaps(
                  dateFrom,
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
                dateFrom,
                dateTo
              });
            }

            if (!candlesInTimeframes)
              throw new Error("Failed to import candles");

            await this.saveCandles(candlesInTimeframes);
            const endedAt = dayjs.utc();
            return {
              success: true,
              jobId: job.id,
              startedAt: startedAt.toISOString(),
              endedAt: endedAt.toISOString(),
              duration: endedAt.diff(startedAt, "second")
            };
          } catch (e) {
            this.logger.error(job.id, job.data, e);
            throw new Errors.MoleculerError(
              `Failed to import history candles jobId: ${job.id}`,
              500,
              this.name,
              { jobId: job.id, params: job.data, error: e }
            );
          }
        }
      }
    ]
  },
  methods: {
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
          const limit = loadLimit(exchange);

          dateTo = getValidDate(dateTo, unit);

          if (!dateFrom && amount) {
            dateFrom = dayjs
              .utc(dateTo)
              .add(-amountInUnit * amount, unit)
              .startOf(unit)
              .toISOString();
          }

          const { chunks, total } = chunkDates(
            dateFrom,
            dateTo,
            unit,
            amountInUnit,
            limit
          );
          this.logger.info(
            `Loading ${total} ${slug} candles by ${chunks.length} chunks`
          );
          await Promise.all(
            chunks.map(async ({ dateFrom }) => {
              const candles = await this.broker.call(
                `${cpz.Service.PUBLIC_CONNECTOR}.getCandles`,
                {
                  exchange,
                  asset,
                  currency,
                  timeframe,
                  dateFrom,
                  limit
                }
              );
              if (!candles || !Array.isArray(candles) || candles.length === 0)
                this.logger.error(`${slug} ${dateFrom} empty response!`);
              else {
                result[timeframe] = [
                  ...new Set(
                    [...result[timeframe], ...candles].filter(
                      candle =>
                        candle.time >= dayjs.utc(dateFrom).valueOf() &&
                        candle.time <= dayjs.utc(dateTo).valueOf()
                    )
                  )
                ].sort((a, b) => sortAsc(a.time, b.time));
              }
            })
          );

          this.logger.info(`Loaded ${slug}`);
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
            trades = [
              ...new Set(
                [...trades, ...response].filter(
                  trade =>
                    trade.time >= dayjs.utc(dateFrom).valueOf() &&
                    trade.time <= dayjs.utc(dateTo).valueOf()
                )
              )
            ].sort((a, b) => sortAsc(a.timestamp, b.timestamp));
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
      await Promise.all(
        Object.keys(candlesInTimeframes).map(async (timeframe: string) => {
          if (candlesInTimeframes[+timeframe].length > 0) {
            const { exchange, asset, currency } = candlesInTimeframes[
              +timeframe
            ][0];
            const chunks = chunkArray(candlesInTimeframes[+timeframe], 1000);

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
        })
      );
    }
  }
};

export = ImporterWorkerService;

import VError from "verror";
import dayjs from "cpzDayjs";
import { v4 as uuid } from "uuid";
import { IMPORTER_SERVICE } from "cpzServices";
import {
  ERROR_TOPIC,
  TASKS_TOPIC,
  LOG_TOPIC,
  ERROR_IMPORTER_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_FINISHED_EVENT,
  LOG_IMPORTER_EVENT
} from "cpzEventTypes";
import {
  STATUS_STARTED,
  STATUS_FINISHED,
  STATUS_ERROR,
  CANDLE_CREATED,
  CANDLE_IMPORTED,
  CANDLE_PREVIOUS,
  createImporterSlug,
  createCachedCandleSlug
} from "cpzState";
import publishEvents from "cpzEvents";
import {
  chunkArray,
  durationMinutes,
  completedPercent,
  sortAsc,
  divideDateByDays
} from "cpzUtils/helpers";
import {
  saveCandlesArrayToCache,
  saveCandlesArrayToTemp,
  clearTempCandles
} from "cpzStorage/candles";
import { saveImporterState } from "cpzStorage/importers";
import { saveCandlesDB } from "cpzDB";
import { createErrorOutput } from "cpzUtils/error";
import { minuteCandlesEX, tradesEX } from "cpzConnector";
import {
  handleCandleGaps,
  getCurrentTimeframes,
  generateCandleRowKey,
  createMinutesList,
  createMinutesListWithRange,
  chunkDates
} from "cpzUtils/candlesUtils";

class Importer {
  constructor(state) {
    /* Тема события */
    this.eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this.taskId = state.taskId;
    /* Режима дебага [true,false] */
    this.debug =
      state.debug === undefined || state.debug === null
        ? process.env.DEBUG
        : state.debug;
    /* Тип провайдера ['ccxt'] */
    this.providerType = state.providerType || "ccxt";
    /* Код биржи */
    this.exchange = state.exchange;
    /* Базовая валюта */
    this.asset = state.asset;
    /* Котировка валюты */
    this.currency = state.currency;
    /* Генерируемые таймфреймы [1, 5, 15, 30, 60, 120, 240, 1440] */
    this.timeframes = state.timeframes || [1, 5, 15, 30, 60, 120, 240, 1440];
    /* Признак необходимости свертывания свечей */
    this.requireBatching = state.requireBatching || true;
    this.saveToCache =
      state.saveToCache === undefined || state.saveToCache === null
        ? false
        : state.saveToCache;
    this.dateFrom = dayjs(
      `${dayjs(state.dateFrom)
        .utc()
        .format("YYYY-MM-DD")}T00:00:00.000Z`
    ).toISOString();
    this.dateTo =
      dayjs(state.dateTo)
        .utc()
        .startOf("minute")
        .valueOf() <
      dayjs()
        .utc()
        .startOf("minute")
        .valueOf()
        ? dayjs(state.dateTo)
            .utc()
            .startOf("minute")
            .toISOString()
        : dayjs()
            .utc()
            .startOf("minute")
            .toISOString();
    /* Лимит загружаемых свечей */
    this.limit = this.getLimit();
    this.loadDurationChunks = chunkDates(
      this.dateFrom,
      this.dateTo,
      this.limit
    );
    this.log("dateFrom", state.dateFrom, this.dateFrom);
    this.log("dateTo", state.dateTo, this.dateTo);
    this.log("loadDurationChunks", this.loadDurationChunks);
    /* Всего свечей для загрузки */
    this.loadTotalDuration = this.loadDurationChunks.total;
    /* Загружено свечей */
    this.loadCompletedDuration = 0;
    /* Осталось загрузить свечей */
    this.loadLeftDuration = this.loadTotalDuration;
    /* Процент выполнения */
    this.loadPercent = 0;
    this.loadedCount = 0;
    this.gaps = 0;
    /* Всего свечей для загрузки */
    this.processTotalDuration = this.loadTotalDuration;
    /* Загружено свечей */
    this.processCompletedDuration = 0;
    /* Осталось загрузить свечей */
    this.processLeftDuration = this.processTotalDuration;
    /* Процент выполнения */
    this.processPercent = 0;
    /* Адрес прокси сервера */
    this.proxy = state.proxy || process.env.PROXY_ENDPOINT;
    /* Текущий статус сервиса */
    this.status = STATUS_STARTED;
    /* Дата и время запуска */
    this.startedAt = dayjs()
      .utc()
      .toISOString();
    /* Дата и время остановки */
    this.endedAt = null;
    /* Метаданные стореджа */
    this.metadata = state.metadata;
    this.candles = [];
  }

  /**
   * Логирование в консоль
   *
   * @param  {...any} args
   * @memberof Importer
   */
  log(...args) {
    if (this.debug) {
      const logData = args.map(arg => JSON.stringify(arg));
      process.send([`Importer ${this.eventSubject}:`, ...logData]);
    }
  }

  /**
   * Логирование в EventGrid
   *
   * @param {*} data
   * @memberof Importer
   */
  logEvent(data) {
    // Публикуем событие
    publishEvents(LOG_TOPIC, {
      service: IMPORTER_SERVICE,
      subject: this.eventSubject,
      eventType: LOG_IMPORTER_EVENT,
      data: {
        taskId: this.taskId,
        data
      }
    });
  }

  getLimit() {
    switch (this.exchange) {
      case "bitfinex":
        return 1000;
      case "kraken":
        return 500;
      case "coinbasepro":
        return 300;
      default:
        return 500;
    }
  }

  createCandles(trades, dateFrom, dateTo) {
    this.log("createCandles()");
    const candles = [];
    const minutes = createMinutesListWithRange(dateFrom, dateTo);
    minutes.forEach(minute => {
      const minuteTrades = [
        ...new Set(
          trades.filter(
            trade =>
              trade.time >=
                dayjs(minute.dateFrom)
                  .utc()
                  .valueOf() &&
              trade.time <=
                dayjs(minute.dateTo)
                  .utc()
                  .valueOf()
          )
        )
      ].sort((a, b) => sortAsc(a.time, b.time));

      if (minuteTrades && minuteTrades.length > 0) {
        candles.push({
          PartitionKey: createCachedCandleSlug({
            exchange: this.exchange,
            asset: this.asset,
            currency: this.currency,
            timeframe: 1
          }),
          RowKey: generateCandleRowKey(minute.dateFrom),
          id: uuid(),
          taskId: this.taskId,
          exchange: this.exchange,
          asset: this.asset,
          currency: this.currency,
          timeframe: 1,
          time: minute.dateFrom, // время в милисекундах
          timestamp: dayjs(minute.dateFrom).toISOString(), // время в ISO UTC
          open: minuteTrades[0].price, // цена открытия - цена первого тика
          high: Math.max(...minuteTrades.map(t => t.price)), // максимальная цена тиков
          low: Math.min(...minuteTrades.map(t => t.price)), // минимальная цена тиков
          close: minuteTrades[minuteTrades.length - 1].price, // цена закрытия - цена последнего тика
          volume: minuteTrades.map(t => t.amount).reduce((a, b) => a + b), // объем - сумма объема всех тиков
          type: CANDLE_CREATED // признак - свеча сформирована
        });
      }
    });

    return candles;
  }

  async loadTradesAndMakeCandles({ dateFrom, dateTo, duration }) {
    try {
      this.log(
        "loadTradesAndMakeCandles()",
        dayjs(dateFrom).toISOString(),
        dayjs(dateTo).toISOString()
      );
      let trades = [];
      let dateNext = dateFrom;
      while (
        dayjs(dateNext)
          .utc()
          .valueOf() <
        dayjs(dateTo)
          .utc()
          .valueOf()
      ) {
        // eslint-disable-next-line no-await-in-loop
        const response = await tradesEX({
          proxy: this.proxy,
          exchange: this.exchange,
          asset: this.asset,
          currency: this.currency,
          date: dayjs(dateNext)
            .utc()
            .toISOString()
        });
        dateNext =
          (response.length > 0 && response[response.length - 1].timestamp) ||
          dateTo;
        const filteredData = [
          ...new Set(
            response.filter(
              trade =>
                trade.time >=
                  dayjs(dateFrom)
                    .utc()
                    .valueOf() &&
                trade.time <=
                  dayjs(dateTo)
                    .utc()
                    .valueOf()
            )
          )
        ].sort((a, b) => sortAsc(a.time, b.time));

        trades = [...new Set(trades.concat(filteredData))].sort((a, b) =>
          sortAsc(a.time, b.time)
        );
      }

      const candles = this.createCandles(trades, dateFrom, dateTo);

      return {
        success: true,
        dateFrom,
        dateTo,
        duration,
        count: candles.length,
        data: candles
      };
    } catch (error) {
      this.log("Error", error.message);
      return {
        success: false,
        date: dateFrom,
        duration,
        count: 0,
        error
      };
    }
  }

  async loadCandles({ dateFrom, dateTo, duration }) {
    try {
      this.log(
        "loadAndSaveCandles",
        dayjs(dateFrom)
          .utc()
          .toISOString(),
        dayjs(dateTo)
          .utc()
          .toISOString(),
        duration
      );
      /* Если биржа "kraken" и грузим больше чем за последние 10 часов  */
      if (
        this.exchange === "kraken" &&
        dayjs()
          .utc()
          .diff(dayjs(dateFrom).utc(), "hours") > 10
      ) {
        /* Собираем минутные свечи по трейдам */
        return await this.loadTradesAndMakeCandles({
          dateFrom,
          dateTo,
          duration
        });
      }
      const response = await minuteCandlesEX({
        proxy: this.proxy,
        exchange: this.exchange,
        asset: this.asset,
        currency: this.currency,
        date: dayjs(dateFrom)
          .utc()
          .toISOString(),
        limit: duration
      });
      if (response && response.length > 0) {
        const filteredData = [
          ...new Set(
            response.filter(
              candle =>
                candle.time >=
                  dayjs(dateFrom)
                    .utc()
                    .valueOf() &&
                candle.time <=
                  dayjs(dateTo)
                    .utc()
                    .valueOf()
            )
          )
        ].sort((a, b) => sortAsc(a.time, b.time));
        if (filteredData && filteredData.length > 0) {
          const data = filteredData.map(candle => ({
            ...candle,
            id: uuid(),
            PartitionKey: createCachedCandleSlug({
              exchange: this.exchange,
              asset: this.asset,
              currency: this.currency,
              timeframe: 1
            }),
            RowKey: generateCandleRowKey(candle.time),
            taskId: this.taskId,
            type: CANDLE_IMPORTED
          }));
          if (data)
            return {
              success: true,
              dateFrom,
              dateTo,
              duration,
              count: data.length,
              data
            };
        }
      }
      this.log("Empty response");
      return {
        success: false,
        dateFrom,
        dateTo,
        duration,
        count: 0,
        error: "Empty response"
      };
    } catch (error) {
      this.log("Error", error.message);
      return {
        success: false,
        date: dateFrom,
        duration,
        count: 0,
        error
      };
    }
  }

  /**
   * Проверка пропусков
   *
   * @memberof Importer
   */
  async handleGaps(inputCandles, dateFrom, dateTo) {
    try {
      let candles = [...inputCandles];
      const duration = durationMinutes(dateFrom, dateTo);
      // Если количество свечей в кэше равно общему количеству свечей - нет пропусков
      if (candles.length === duration) return { candles, gappedCandles: [] };

      const gappedCandles = handleCandleGaps(
        {
          exchange: this.exchange,
          asset: this.asset,
          currency: this.currency,
          timeframe: 1,
          taskId: this._taskId
        },
        dateFrom,
        dateTo,
        duration,
        candles
      );
      if (gappedCandles.length > 0) {
        candles = [...new Set(candles.concat(gappedCandles))].sort((a, b) =>
          sortAsc(a.time, b.time)
        );
      }

      return { candles, gappedCandles };
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this.taskId,
            eventSubject: this.eventSubject
          }
        },
        `Failed to check cached candles gaps`
      );
    }
  }

  /**
   * Свертывание загруженных свечей
   *
   * @memberof Importer
   */
  batchCandles(tempCandles, dateFrom, dateTo, duration) {
    try {
      // Инициализируем объект со свечами в различных таймфреймах
      const timeframeCandles = {};
      this.timeframes.forEach(timeframe => {
        timeframeCandles[timeframe] = [];
        if (timeframe === 1) {
          timeframeCandles[1] = [...tempCandles];
        }
      });
      // Если не нужно свертывать свечи - выходим
      if (!this.requireBatching) return null;
      // Создаем список с полным количеством минут
      const fullMinutesList = createMinutesList(dateFrom, dateTo, duration); // добавляем еще одну свечу чтобы сформировать прошедший таймфрейм
      fullMinutesList.forEach(time => {
        const date = dayjs(time).utc();
        // Пропускаем самую первую свечу
        if (
          dayjs(dateFrom)
            .utc()
            .valueOf() === date.valueOf()
        )
          return;
        const currentTimeframes = getCurrentTimeframes(this.timeframes, time);
        if (currentTimeframes.length > 0) {
          currentTimeframes.forEach(timeframe => {
            const timeFrom = date.add(-timeframe, "minute").valueOf();
            const timeTo = date.valueOf();
            const candles = tempCandles
              .filter(candle => candle.time >= timeFrom && candle.time < timeTo)
              .sort((a, b) => sortAsc(a.time, b.time));
            if (candles.length > 0) {
              timeframeCandles[timeframe].push({
                id: uuid(),
                PartitionKey: createCachedCandleSlug({
                  exchange: this.exchange,
                  asset: this.asset,
                  currency: this.currency,
                  timeframe
                }),
                RowKey: generateCandleRowKey(timeFrom),
                taskId: this.taskId,
                exchange: this.exchange,
                asset: this.asset,
                currency: this.currency,
                timeframe,
                time: timeFrom, // время в милисекундах
                timestamp: dayjs(timeFrom)
                  .utc()
                  .toISOString(), // время в ISO UTC
                open: candles[0].open, // цена открытия - цена открытия первой свечи
                high: Math.max(...candles.map(t => t.high)), // максимальная цена
                low: Math.min(...candles.map(t => t.low)), // минимальная цена
                close: candles[candles.length - 1].close, // цена закрытия - цена закрытия последней свечи
                volume: candles.map(t => t.volume).reduce((a, b) => a + b), // объем - сумма объема всех свечей
                count: candles.length,
                gap: candles.length !== timeframe,
                type:
                  candles.filter(candle => candle.type === CANDLE_PREVIOUS)
                    .length === timeframe
                    ? CANDLE_PREVIOUS
                    : CANDLE_CREATED
              });
            }
          });
        }
      });
      return timeframeCandles;
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this.taskId,
            eventSubject: this.eventSubject
          }
        },
        `Failed to batch cached candles`
      );
    }
  }

  /**
   * Сохранение свечей в кэш
   *
   * @memberof Importer
   */
  async saveCandles(timeframeCandles) {
    try {
      await Promise.all(
        this.timeframes.map(async timeframe => {
          if (timeframeCandles[timeframe].length > 0) {
            try {
              if (this.saveToCache)
                await saveCandlesArrayToCache(timeframeCandles[timeframe]);
              await saveCandlesDB({
                timeframe,
                candles: timeframeCandles[timeframe]
              });
            } catch (error) {
              throw new VError(
                {
                  name: "ImporterError",
                  cause: error,
                  info: {
                    taskId: this.taskId,
                    eventSubject: this.eventSubject
                  }
                },
                `Failed to save timeframed candles to db`
              );
            }
          }
        })
      );
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this.taskId,
            eventSubject: this.eventSubject
          }
        },
        `Failed to save candles`
      );
    }
  }

  /**
   * Очистка временных свечей
   *
   * @memberof Importer
   */
  async clearTemp() {
    try {
      this.log("Clearing temp data...");
      await clearTempCandles(this.taskId);
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this.taskId,
            eventSubject: this.eventSubject
          }
        },
        `Failed to clear temp candles`
      );
    }
  }

  async execute() {
    try {
      await publishEvents(TASKS_TOPIC, {
        service: IMPORTER_SERVICE,
        subject: this.eventSubject,
        eventType: TASKS_IMPORTER_STARTED_EVENT,
        data: {
          taskId: this.taskId
        }
      });
      const loadChunks = chunkArray(this.loadDurationChunks.chunks, 10);
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      this.log("Starting loading candles...");
      for (const loadChunk of loadChunks) {
        const loadIterationResult = await Promise.all(
          loadChunk.map(async ({ dateFrom, dateTo, duration }) =>
            this.loadCandles({ dateFrom, dateTo, duration })
          )
        );

        const errorLoads = loadIterationResult.filter(
          result => result.success === false
        );
        this.log("erroLoads", errorLoads);
        const retryLoadIterationResult = await Promise.all(
          errorLoads.map(async ({ dateFrom, dateTo, duration }) =>
            this.loadCandles({ dateFrom, dateTo, duration })
          )
        );

        const retryErrorLoads = retryLoadIterationResult.filter(
          result => result.success === false
        );

        if (retryErrorLoads.length > 0) {
          throw new VError(
            {
              name: "ImportCandles",
              info: {
                errorIterations: retryErrorLoads.map(errorLoad => ({
                  dateFrom: errorLoad.dateFrom,
                  dateTo: errorLoad.dateTo,
                  duration: errorLoad.duration
                }))
              }
            },
            "Failed to load chunk of candles"
          );
        }

        const successLoads = [
          ...loadIterationResult.filter(result => result.success === true),
          ...retryLoadIterationResult.filter(result => result.success === true)
        ];

        const duration = successLoads
          .map(load => load.duration)
          .reduce((acc, curr) => acc + curr);
        const loaded = successLoads
          .map(load => load.count)
          .reduce((acc, curr) => acc + curr);
        const data = successLoads
          .map(load => load.data)
          .reduce((acc, curr) => acc.concat(curr), []);
        this.candles = [...new Set(this.candles.concat(data))].sort((a, b) =>
          sortAsc(a.time, b.time)
        );
        this.loadCompletedDuration = this.loadCompletedDuration + duration;
        this.loadLeftDuration =
          this.loadTotalDuration - this.loadCompletedDuration;

        // Процент выполнения
        this.loadPercent = completedPercent(
          this.loadCompletedDuration,
          this.loadTotalDuration
        );
        this.loadedCount = this.loadedCount + loaded;
        let gaps = 0;
        if (loaded < duration) {
          gaps = duration - loaded;
        }
        this.gaps = this.gaps + gaps;
        await this.save();
        this.log(
          `Loaded ${this.loadCompletedDuration} of ${this.loadTotalDuration}${
            gaps > 0 ? ` but gapped: ${gaps}` : ""
          } - ${this.loadPercent}%`
        );
      }
      /*  no-restricted-syntax, no-await-in-loop */

      const fullDays = divideDateByDays(this.dateFrom, this.dateTo);
      this.log("Starting processing loaded candles...");
      for (const { dateFrom, dateTo, duration } of fullDays) {
        let tempCandles = this.candles.filter(
          candle =>
            candle.time >=
              dayjs(dateFrom)
                .utc()
                .valueOf() &&
            candle.time <
              dayjs(dateTo)
                .utc()
                .valueOf()
        );
        /*
        await getTempCandles({
          dateFrom,
          dateTo,
          slug: createCachedCandleSlug({
            exchange: this.exchange,
            asset: this.asset,
            currency: this.currency,
            timeframe: 1
          })
        }); */
        tempCandles = tempCandles.sort((a, b) => sortAsc(a.time, b.time));

        const { candles, gappedCandles } = await this.handleGaps(
          tempCandles,
          dateFrom,
          dateTo
        );

        if (gappedCandles.length > 0) {
          // Сохраняем сформированные пропущенные свечи
          await saveCandlesArrayToTemp(gappedCandles);
        }

        const timeframeCandles = this.batchCandles(
          candles,
          dateFrom,
          dateTo,
          duration
        );

        if (timeframeCandles) {
          await this.saveCandles(timeframeCandles);
        }

        this.processCompletedDuration =
          this.processCompletedDuration + duration;
        this.processLeftDuration =
          this.processTotalDuration - this.processCompletedDuration;

        this.processPercent = completedPercent(
          this.processCompletedDuration,
          this.processTotalDuration
        );
        await this.save();
        this.log(
          `Processed ${this.processCompletedDuration} of ${
            this.processTotalDuration
          } - ${this.processPercent}%`
        );
      }

      // await this.clearTemp();
      this.endedAt = dayjs()
        .utc()
        .toISOString();
      this.status = STATUS_FINISHED;

      await this.save();
      const duration = dayjs(this.endedAt)
        .utc()
        .diff(dayjs(this.startedAt).utc(), "minute");
      this.log(`Finished import in ${duration} minutes!!!`);
      await publishEvents(TASKS_TOPIC, {
        service: IMPORTER_SERVICE,
        subject: this.eventSubject,
        eventType: TASKS_IMPORTER_FINISHED_EVENT,
        data: {
          taskId: this.taskId,
          duration
        }
      });
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "ImporterError",
            cause: error
          },
          "Failed to execute importer"
        )
      );
      this.log(errorOutput);
      // Если есть экземпляр класса
      this.status = STATUS_ERROR;
      this.error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await this.save();
      // Публикуем событие - ошибка
      await publishEvents(ERROR_TOPIC, {
        service: IMPORTER_SERVICE,
        subject: this.eventSubject,
        eventType: ERROR_IMPORTER_EVENT,
        data: {
          taskId: this.taskId,
          eventSubject: this.eventSubject,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
    }
  }

  getCurrentState() {
    const state = {
      PartitionKey: createImporterSlug({
        exchange: this.exchange,
        asset: this.asset,
        currency: this.currency
      }),
      RowKey: this.taskId,
      taskId: this.taskId,
      eventSubject: this.eventSubject,
      debug: this.debug,
      providerType: this.providerType,
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframes: this.timeframes,
      requireBatching: this.requireBatching,
      saveToCache: this.saveToCache,
      limit: this.limit,
      loadTotalDuration: this.loadTotalDuration,
      loadCompletedDuration: this.loadCompletedDuration,
      loadLeftDuration: this.loadLeftDuration,
      loadPercent: this.loadPercent,
      processTotalDuration: this.processTotalDuration,
      processCompletedDuration: this.processCompletedDuration,
      processLeftDuration: this.processLeftDuration,
      processPercent: this.processPercent,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      proxy: this.proxy,
      status: this.status,
      error: this.error,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      metadata: this.metadata
    };
    return state;
  }

  async save() {
    try {
      await saveImporterState(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this.taskId,
            eventSubject: this.eventSubject
          }
        },
        `Failed to save importer state`
      );
    }
  }
}

export default Importer;

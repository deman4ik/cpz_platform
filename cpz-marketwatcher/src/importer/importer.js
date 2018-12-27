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
  createImporterSlug,
  createCachedCandleSlug
} from "cpzState";
import publishEvents from "cpzEvents";
import {
  chunkArray,
  chunkNumberToArray,
  durationMinutes,
  completedPercent,
  sortAsc,
  divideDateByDays
} from "cpzUtils/helpers";
import {
  saveImporterState,
  saveCandlesArrayToCache,
  saveCandlesArrayToTemp,
  getTempCandles,
  clearTempCandles
} from "cpzStorage";
import { saveCandlesDB } from "cpzDB";
import { createErrorOutput } from "cpzUtils/error";
import { minuteCandlesEX } from "cpzConnector";
import {
  handleCandleGaps,
  getCurrentTimeframes,
  generateCandleRowKey,
  createMinutesList
} from "cpzUtils/candlesUtils";

class Importer {
  constructor(state) {
    /* Тема события */
    this.eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this.taskId = state.taskId;
    /* Режима дебага [true,false] */
    this.debug = state.debug || false;
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
    this.saveToCache = state.saveToCache || false;
    this.dateFrom = dayjs(state.dateFrom)
      .startOf("minute")
      .toISOString();
    this.dateTo =
      dayjs(state.dateTo)
        .startOf("minute")
        .valueOf() <
      dayjs()
        .startOf("minute")
        .valueOf()
        ? dayjs(state.dateTo).toISOString()
        : dayjs().toISOString();
    /* Лимит загружаемых свечей */
    this.limit = this.getLimit();
    /* Всего свечей для загрузки */
    this.loadTotalDuration = durationMinutes(this.dateFrom, this.dateTo);
    /* Загружено свечей */
    this.loadCompletedDuration = 0;
    /* Осталось загрузить свечей */
    this.loadLeftDuration = this.loadTotalDuration;
    /* Процент выполнения */
    this.loadPercent = 0;
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
    this.startedAt = dayjs().toISOString();
    /* Дата и время остановки */
    this.endedAt = null;
    /* Метаданные стореджа */
    this.metadata = state.metadata;
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
      process.send([`Backtester ${this.eventSubject}:`, ...logData]);
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

  async loadAndSaveCandles({ date, limit }) {
    try {
      const response = await minuteCandlesEX({
        proxy: this.proxy,
        exchange: this.exchange,
        asset: this.asset,
        currency: this.currency,
        date: date.toISOString(),
        limit
      });
      if (response && response.length > 0) {
        const filteredData = response
          .filter(
            candle =>
              candle.time >= dayjs(this.dateFrom).valueOf() &&
              candle.time < dayjs(this.dateTo).valueOf()
          )
          .sort((a, b) => sortAsc(a.time, b.time));
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
          if (data) await saveCandlesArrayToTemp(data);
          return { success: true, date, limit };
        }
      }
      return {
        success: false,
        date,
        limit,
        error: "Empty response"
      };
    } catch (error) {
      this.log(`loadAndSaveCandles() error: ${error.message}`, error);
      return {
        success: false,
        date,
        limit,
        error
      };
    }
  }

  /**
   * Проверка пропусков
   *
   * @memberof Importer
   */
  async handleGaps(inputCandles, dateFrom, dateTo, duration) {
    const candles = inputCandles;
    try {
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
        candles.concat(gappedCandles).sort((a, b) => sortAsc(a.time, b.time));
        this.log(`Gapped candles: ${gappedCandles.length}`);
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
          timeframeCandles[1] = tempCandles;
        }
      });
      // Если не нужно свертывать свечи - выходим
      if (!this.requireBatching) return null;
      // Создаем список с полным количеством минут
      const fullMinutesList = createMinutesList(dateFrom, dateTo, duration);
      fullMinutesList.forEach(time => {
        const date = dayjs(time);
        // Пропускаем самую первую свечу
        if (dayjs(dateFrom).valueOf() === date.valueOf()) return;
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
                timestamp: dayjs(timeFrom).toISOString(), // время в ISO UTC
                open: candles[0].open, // цена открытия - цена открытия первой свечи
                high: Math.max(...candles.map(t => t.high)), // максимальная цена
                low: Math.min(...candles.map(t => t.low)), // минимальная цена
                close: candles[candles.length - 1].close, // цена закрытия - цена закрытия последней свечи
                volume: candles.map(t => t.volume).reduce((a, b) => a + b), // объем - сумма объема всех свечей
                count: candles.length,
                gap: candles.length !== timeframe,
                type: CANDLE_CREATED // признак - свеча сформирована
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

      const loadDurationChunks = chunkNumberToArray(
        this.loadTotalDuration,
        this.limit
      );
      const loadFullChunks = [];
      let dateNext;
      loadDurationChunks.forEach(loadDurationChunk => {
        dateNext = dateNext
          ? dateNext.add(loadDurationChunk, "minute")
          : dayjs(this.dateFrom);

        loadFullChunks.push({ date: dateNext, limit: loadDurationChunk });
      });

      const loadChunks = chunkArray(loadFullChunks, 10);
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      this.log("Starting loading candles...");
      for (const loadChunk of loadChunks) {
        const loadIterationResult = await Promise.all(
          loadChunk.map(async ({ date, limit }) =>
            this.loadAndSaveCandles({ date, limit })
          )
        );

        const errorLoads = loadIterationResult.filter(
          result => result.success === false
        );

        const retryLoadIterationResult = await Promise.all(
          errorLoads.map(async ({ date, limit }) =>
            this.loadAndSaveCandles({ date, limit })
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
                  date: errorLoad.date,
                  limit: errorLoad.limit
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

        this.loadCompletedDuration =
          this.loadCompletedDuration +
          successLoads
            .map(load => load.limit)
            .reduce((acc, curr) => acc + curr);
        this.loadLeftDuration =
          this.loadTotalDuration - this.loadCompletedDuration;

        // Процент выполнения
        this.loadPercent = completedPercent(
          this.loadCompletedDuration,
          this.loadTotalDuration
        );

        await this.save();
        this.log(
          `Loaded ${this.loadCompletedDuration} of ${
            this.loadTotalDuration
          } - ${this.loadPercent}%`
        );
      }
      /*  no-restricted-syntax, no-await-in-loop */

      const fullDays = divideDateByDays(this.dateFrom, this.dateTo);
      this.log("Starting processing loaded candles...");
      for (const { dateFrom, dateTo, duration } of fullDays) {
        this.log(
          `Processing from ${dayjs(dateFrom).toISOString()} to ${dayjs(
            dateTo
          ).toISOString()} duration ${duration}`
        );
        let tempCandles = await getTempCandles({
          dateFrom,
          dateTo,
          slug: createCachedCandleSlug({
            exchange: this.exchange,
            asset: this.asset,
            currency: this.currency,
            timeframe: 1
          })
        });
        tempCandles = tempCandles.sort((a, b) => sortAsc(a.time, b.time));

        const { candles, gappedCandles } = await this.handleGaps(
          tempCandles,
          dateFrom,
          dateTo,
          duration
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
          `Finished processing ${this.processPercent}% from ${dayjs(
            dateFrom
          ).toISOString()} to ${dayjs(dateTo).toISOString()}`
        );
      }

      await this.clearTemp();
      this.endedAt = dayjs().toISOString();
      this.status = STATUS_FINISHED;

      await this.save();
      const duration = dayjs(this.endedAt).diff(
        dayjs(this.startedAt),
        "minute"
      );
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
      this.error = { code: errorOutput.name, message: errorOutput.message };
      await this.save();
      // Публикуем событие - ошибка
      await publishEvents(ERROR_TOPIC, {
        service: IMPORTER_SERVICE,
        subject: this.eventSubject,
        eventType: ERROR_IMPORTER_EVENT,
        data: {
          taskId: this.taskId,
          eventSubject: this.eventSubject,
          error: { code: errorOutput.name, message: errorOutput.message }
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

import VError from "verror";
import dayjs from "cpzDayjs";
import { v4 as uuid } from "uuid";
import { IMPORTER_SERVICE } from "cpzServices";
import { LOG_IMPORTER_EVENT, LOG_TOPIC } from "cpzEventTypes";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_FINISHED,
  CANDLE_CREATED,
  createImporterSlug,
  createCachedCandleSlug
} from "cpzState";
import publishEvents from "cpzEvents";
import {
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
import DB from "cpzDB";
import {
  handleCandleGaps,
  getCurrentTimeframes,
  generateCandleRowKey,
  createMinutesList
} from "../utils";
import { queueImportIteration } from "../queueStorage";
import CCXTProvider from "../providers/ccxtProvider";

class Importer {
  constructor(context, state) {
    /* Текущий контекст выполнения */
    this._context = context;
    /* Тема события */
    this._eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Режим работы ['backtest', 'emulator', 'realtime'] */
    this._mode = state.mode;
    /* Режима дебага [true,false] */
    this._debug = state.debug || false;
    /* Тип провайдера ['ccxt'] */
    this._providerType = state.providerType;
    /* Код биржи */
    this._exchange = state.exchange;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Генерируемые таймфреймы [1, 5, 15, 30, 60, 120, 240, 1440] */
    this._timeframes = state.timeframes || [1, 5, 15, 30, 60, 120, 240, 1440];
    /* Признак необходимости свертывания свечей */
    this._requireBatching = state.requireBatching || true;
    this._saveToCache = state.saveToCache || false;
    /* Дата с */
    this._dateFrom = state.dateFrom;
    /* Дата по */
    this._dateTo = state.dateTo;
    /* Дата начало следующей загрузки */
    this._loadDateNext = state.loadDateNext || false;
    this._saveDateNext = state.saveDateNext || false;
    /* Лимит загружаемых свечей */
    this._limit = state.limit || 500;
    /* Всего свечей для загрузки */
    this._totalDuration = state.totalDuration;
    /* Загружено свечей */
    this._completedDuration = state.completedDuration || 0;
    /* Осталось загрузить свечей */
    this._leftDuration = state.leftDuration;
    /* Процент выполнения */
    this._percent = state.percent || 0;
    /* Адрес прокси сервера */
    this._proxy = state.proxy || process.env.PROXY_ENDPOINT;
    /* Признак запроса на остановку сервиса [true,false] */
    this._stopRequested = state.stopRequested || false;
    /* Текущий статус сервиса */
    this._status = this._stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED;
    /* Дата и время запуска */
    this._startedAt = state.startedAt || dayjs().toISOString();
    /* Дата и время остановки */
    this._endedAt = this._stopRequested
      ? dayjs().toISOString()
      : state.endedAt || "";
    this._initialized = state.initialized || false;
    /* Метаданные стореджа */
    this._metadata = state.metadata;
    this._db = state.db || new DB();
    /* Инициализация */
    this.init();
    /* Запуск инициализации провайдера */
    this.initProvider();
    this.log(`Importer initialized`);
  }

  /**
   * Логирование в консоль
   *
   * @param  {...any} args
   * @memberof Importer
   */
  log(...args) {
    if (this._debug) {
      this._context.log.info(`Importer ${this._eventSubject}:`, ...args);
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
      subject: this._eventSubject,
      eventType: LOG_IMPORTER_EVENT,
      data: {
        taskId: this._taskId,
        data
      }
    });
  }

  init() {
    if (!this._initialized) {
      this._dateFrom = dayjs(this._dateFrom)
        .startOf("minute")
        .toISOString();
      const dateTo = dayjs(this._dateTo)
        .startOf("minute")
        .valueOf();
      const currentDate = dayjs()
        .startOf("minute")
        .valueOf();
      this._dateTo =
        dateTo < currentDate
          ? dayjs(dateTo).toISOString()
          : dayjs(currentDate).toISOString();
      this._loadDateNext = this._dateTo;
      this._initialized = true;
    }
  }

  /**
   * Инициализация провайдера
   *
   * @memberof Importer
   */
  initProvider() {
    try {
      const initParams = {
        taskId: this._taskId,
        mode: this._mode,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        limit: this._limit,
        dateFrom: this._dateFrom,
        dateTo: this._dateTo,
        proxy: this._proxy
      };
      switch (this._providerType) {
        case "ccxt":
          this.provider = new CCXTProvider(initParams);
          break;
        default:
          throw new Error(`Unknown provider "${this._providerType}"`);
      }
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to init provider "${this._providerType}"`
      );
    }
  }

  /**
   * Запрос текущего статуса сервиса
   *
   * @returns status
   * @memberof Importer
   */
  get status() {
    return this._status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns updateRequested
   * @memberof Importer
   */
  get updateRequested() {
    return this._updateRequested;
  }

  get loaded() {
    return !this._loadDateNext;
  }

  get saved() {
    return !this._saveDateNext;
  }

  /**
   * Установка статуса сервиса
   *
   * @param {*} status
   * @memberof Trader
   */
  set status(status) {
    if (status) this._status = status;
    if (this.loaded && this.saved) {
      this._status = STATUS_FINISHED;
    }
    if (this._status === STATUS_STOPPED || this._status === STATUS_FINISHED)
      this._endedAt = dayjs().toJSON();
  }

  /**
   * Загрзука свечей с биржи
   *
   * @memberof Importer
   */
  async loadCandles() {
    if (!this.loaded) {
      try {
        this.log(
          "Loading",
          this._limit,
          "candles date to",
          dayjs(this._loadDateNext).toISOString()
        );
        const { firstDate, data } = await this.provider.loadCandles(
          this._loadDateNext
        );
        // Загруженные свечи
        this._candles = data;
        this.log("Loaded:", this._candles.length);
        // Всего минут
        this._totalDuration =
          this._totalDuration || durationMinutes(this._dateFrom, this._dateTo);
        // Осталось минут
        this._leftDuration = durationMinutes(this._dateFrom, firstDate, true);
        // Загружено минут
        this._completedDuration = this._totalDuration - this._leftDuration;
        // Процент выполнения
        this._percent = completedPercent(
          this._completedDuration,
          this._totalDuration
        );

        // Если дата начала импорта раньше чем дата первой загруженной свечи
        this._loadDateNext = null;
        if (dayjs(this._dateFrom).isBefore(dayjs(firstDate))) {
          // Формируем параметры нового запроса на импорт
          this._loadDateNext = firstDate;
          this.log("Next date to:", dayjs(this._loadDateNext).toISOString());
        }
      } catch (error) {
        throw new VError(
          {
            name: "ImporterError",
            cause: error,
            info: {
              taskId: this._taskId,
              eventSubject: this._eventSubject
            }
          },
          `Failed to load candles`
        );
      }
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
        this._timeframes.map(async timeframe => {
          if (timeframeCandles[timeframe].length > 0) {
            try {
              if (this._saveToCache)
                await saveCandlesArrayToCache(timeframeCandles[timeframe]);
              await this._db.saveCandles({
                timeframe,
                candles: timeframeCandles[timeframe]
              });
            } catch (error) {
              throw new VError(
                {
                  name: "ImporterError",
                  cause: error,
                  info: {
                    taskId: this._taskId,
                    eventSubject: this._eventSubject
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
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to save candles`
      );
    }
  }

  /**
   * Сохранение временных свечей
   *
   * @memberof Importer
   */
  async saveCandlesToTemp() {
    try {
      if (this._candles.length > 0) await saveCandlesArrayToTemp(this._candles);
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to save candles to temp`
      );
    }
  }

  /**
   * Очистка временных свечей
   *
   * @memberof Importer
   */
  async _clearTemp() {
    try {
      await clearTempCandles(this._taskId);
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to clear temp candles`
      );
    }
  }

  /**
   * Добавление следующей итерации в очередь
   *
   * @memberof Importer
   */
  async queueNext() {
    try {
      if (!this.loaded || !this.saved) {
        const message = {
          taskId: this._taskId
        };
        await queueImportIteration(message);
      }
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to queue import iteration`
      );
    }
  }

  async finalize() {
    try {
      const saveDateNext = this._saveDateNext || this._dateFrom;
      const fullDates = divideDateByDays(saveDateNext, this._dateTo);

      let dates = [];
      if (fullDates.length > 10) {
        dates = fullDates.slice(0, 10);
        this._saveDateNext = fullDates[9].dateTo;
      } else {
        dates = fullDates;
        this._saveDateNext = null;
      }
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const { dateFrom, dateTo, duration } of dates) {
        this.log(
          "Processing from",
          dayjs(dateFrom).toISOString(),
          "to",
          dayjs(dateTo).toISOString()
        );
        let tempCandles = await getTempCandles({
          dateFrom,
          dateTo,
          slug: createCachedCandleSlug({
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency,
            timeframe: 1,
            mode: this._mode
          })
        });
        tempCandles = tempCandles.sort((a, b) => sortAsc(a.time, b.time));

        const { candles, gappedCandles } = await this._handleGaps(
          tempCandles,
          dateFrom,
          dateTo,
          duration
        );

        if (gappedCandles.length > 0) {
          // Сохраняем сформированные пропущенные свечи
          await saveCandlesArrayToTemp(gappedCandles);
        }
        const timeframeCandles = this._batchCandles(
          candles,
          dateFrom,
          dateTo,
          duration
        );

        if (timeframeCandles) {
          await this.saveCandles(timeframeCandles);
        }
        this.log(
          "Finished processing from",
          dayjs(dateFrom).toISOString(),
          "to",
          dayjs(dateTo).toISOString()
        );
      }
      if (this._saveDateNext)
        this.log("Next date to save:", dayjs(this._saveDateNext).toISOString());
      /* no-restricted-syntax, no-await-in-loop */
      if (this.saved) await this._clearTemp();
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to finalize `
      );
    }
  }

  /**
   * Проверка пропусков
   *
   * @memberof Importer
   */
  async _handleGaps(inputCandles, dateFrom, dateTo, duration) {
    const candles = inputCandles;
    try {
      // Если количество свечей в кэше равно общему количеству свечей - нет пропусков
      if (candles.length === duration) return { candles, gappedCandles: [] };

      const gappedCandles = handleCandleGaps(
        {
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: 1,
          mode: this._mode
        },
        dateFrom,
        dateTo,
        duration,
        candles
      );
      if (gappedCandles.length > 0) {
        candles.concat(gappedCandles).sort((a, b) => sortAsc(a.time, b.time));
        this.log("Gapped candles:", gappedCandles.length);
      }
      return { candles, gappedCandles };
    } catch (error) {
      throw new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
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
  _batchCandles(tempCandles, dateFrom, dateTo, duration) {
    try {
      // Инициализируем объект со свечами в различных таймфреймах
      const timeframeCandles = {};
      this._timeframes.forEach(timeframe => {
        timeframeCandles[timeframe] = [];
        if (timeframe === 1) {
          timeframeCandles[1] = tempCandles;
        }
      });
      // Если не нужно свертывать свечи - выходим
      if (!this._requireBatching) return null;
      // Создаем список с полным количеством минут
      const fullMinutesList = createMinutesList(dateFrom, dateTo, duration);
      fullMinutesList.forEach(time => {
        const date = dayjs(time);
        // Пропускаем самую первую свечу
        if (dayjs(dateFrom).valueOf() === date.valueOf()) return;
        const currentTimeframes = getCurrentTimeframes(this._timeframes, time);
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
                  exchange: this._exchange,
                  asset: this._asset,
                  currency: this._currency,
                  timeframe: this._timeframe,
                  mode: this._mode
                }),
                RowKey: generateCandleRowKey(timeFrom),
                taskId: this._taskId,
                exchange: this._exchange,
                asset: this._asset,
                currency: this._currency,
                mode: this._mode,
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
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to batch cached candles`
      );
    }
  }

  getCurrentState() {
    const state = {
      PartitionKey: createImporterSlug({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        mode: this._mode
      }),
      RowKey: this._taskId,
      taskId: this._taskId,
      eventSubject: this._eventSubject,
      mode: this._mode,
      debug: this._debug,
      providerType: this._providerType,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframes: this._timeframes,
      requireBatching: this._requireBatching,
      limit: this._limit,
      totalDuration: this._totalDuration,
      completedDuration: this._completedDuration,
      leftDuration: this._leftDuration,
      percent: this._percent,
      dateFrom: this._dateFrom,
      dateTo: this._dateTo,
      loadDateNext: this._loadDateNext,
      saveDateNext: this._saveDateNext,
      proxy: this._proxy,
      status: this._status,
      error: this.error,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      initialized: this._initialized,
      metadata: this._metadata
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
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to save importer state`
      );
    }
  }

  /**
   * Завершение работы итерации
   *
   * @param {*} status
   * @param {*} error
   * @memberof Importer
   */
  async end(status, error) {
    try {
      this._status = status;
      this._error = error;
      this._updateRequested = false; // Обнуляем запрос на обновление параметров
      this._stopRequested = false; // Обнуляем запрос на остановку сервиса
      await this.save();
    } catch (err) {
      if (err instanceof VError) {
        throw err;
      } else {
        throw new VError(
          {
            name: "ImporterError",
            cause: error,
            info: {
              taskId: this._taskId,
              eventSubject: this._eventSubject
            }
          },
          'Failed to end importer execution "%s"',
          this._taskId
        );
      }
    }
  }
}

export default Importer;

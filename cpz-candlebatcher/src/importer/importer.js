import VError from "verror";
import dayjs from "cpzDayjs";
import { saveCandlesArray } from "cpzDB/saveCandles";
import {
  createCandlebatcherSlug,
  createCachedCandleSlug
} from "cpzStorage/utils";
import { IMPORTER_SERVICE } from "cpzServices";
import { LOG_IMPORTER_EVENT, LOG_TOPIC } from "cpzEventTypes";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_FINISHED } from "cpzState";
import publishEvents from "cpzEvents";
import { durationMinutes, completedPercent, modeToStr } from "cpzUtils/helpers";
import { handleCandleGaps, getCurrentTimeframes } from "../utils";
import { queueImportIteration } from "../queueStorage";
import {
  saveImporterState,
  saveCandlesArrayToCache,
  saveCandlesArrayToTemp,
  getTempCandles
} from "../tableStorage";
import CryptocompareProvider from "../providers/cryptocompareProvider";
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
    /* Тип провайдера ['ccxt','cryptocompare'] */
    this._providerType = state.providerType;
    /* Код биржи */
    this._exchange = state.exchange;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Генерируемые таймфреймы */
    this._timeframes = state.timeframes || [1, 5, 15, 30, 60, 120, 240, 1440];
    /* Признак необходимости свертывания свечей */
    this._requireBatching = state.requireBatching || true;
    /* Дата с */
    this._dateFrom = dayjs(state.dateFrom)
      .startOf("minute")
      .toISOString();
    /* Дата по */
    this._dateTo = dayjs(state.dateTo)
      .startOf("minute")
      .toISOString();
    /* Дата начало следующей загрузки */
    this._dateNext = state.dateNext;
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
    /* Метаданные стореджа */
    this._metadata = state.metadata;
    /* Запуск инициализации провайдера */
    this.initProvider();
    this.log(`Importer ${this._eventSubject} initialized`);
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

  /**
   * Инициализация провайдера
   *
   * @memberof Importer
   */
  initProvider() {
    this.log(`initProvider()`);
    try {
      const initParams = {
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        limit: this._limit,
        dateFrom: this._dateFrom,
        dateTo: this._dateTo,
        proxy: this._proxy
      };
      switch (this._providerType) {
        case "cryptocompare":
          this.provider = new CryptocompareProvider(initParams);
          break;
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

  /**
   * Установка статуса сервиса
   *
   * @param {*} status
   * @memberof Trader
   */
  set status(status) {
    if (status) this._status = status;
    if (!this._dateNext) {
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
    this.log(`loadCandles()`);
    try {
      const result = await this.provider.loadCandles(this._dateNext);
      this.log(`loadCandles() result:`, result);
      // Загруженные свечи
      this.candles = result.data;
      // Всего минут
      this._totalDuration =
        this._totalDuration || durationMinutes(this._dateFrom, this._dateEnd);
      // Осталось минут
      this._leftDuration = durationMinutes(
        this._dateFrom,
        result.firstDate,
        true
      );
      // Загружено минут
      this._completedDuration = this._totalDuration - this._leftDuration;
      // Процент выполнения
      this._percent = completedPercent(
        this._completedDuration,
        this._totalDuration
      );

      // Если дата начала импорта раньше чем дата первой загруженной свечи
      this._dateNext = null;
      if (dayjs(this._dateFrom).isBefore(dayjs(result.firstDate))) {
        // Формируем параметры нового запроса на импорт
        this._dateNext = result.firstDate;
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

  /**
   * Сохранение свечей в кэш
   *
   * @memberof Importer
   */
  async saveCandlesToCache() {
    this.log(`saveCandlesToCache()`);
    try {
      await saveCandlesArrayToCache(this.candles);
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
   * Сохранение временных свечей
   *
   * @memberof Importer
   */
  async saveCandlesToTemp() {
    this.log(`saveCandlesToTemp()`);
    try {
      await saveCandlesArrayToTemp(this.candles);
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
   * Добавление следующей итерации в очередь
   *
   * @memberof Importer
   */
  async queueNext() {
    this.log(`queueNext()`);
    try {
      if (this._dateNext) {
        const message = {
          rowKey: this._taskId,
          partitionKey: createCandlebatcherSlug(
            this._exchange,
            this._asset,
            this._currency,
            modeToStr(this._mode)
          )
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

  /**
   * Загрузка свечей из кэша
   *
   * @memberof Importer
   */
  async loadCachedCandles() {
    try {
      this._cachedCandles = await getTempCandles({
        dateFrom: this._dateFrom,
        dateTo: this._dateTo,
        slug: createCachedCandleSlug(
          this._exchange,
          this._asset,
          this._currency,
          1,
          this._mode
        )
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
        `Failed to load cached candles`
      );
    }
  }

  /**
   * Проверка пропусков
   *
   * @memberof Importer
   */
  async handleGaps() {
    this.log("handleGaps()");
    try {
      // Если количество свечей в кэше равно общему количеству свечей - нет пропусков
      if (this._cachedCandles.length === this._totalDuration) return;

      const { candles, gappedCandles } = handleCandleGaps(
        {
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: 1,
          modeStr: modeToStr(this._mode)
        },
        this._dateFrom,
        this._dateTo,
        this._totalDuration,
        this._cachedCandles
      );
      if (candles) this._cachedCandles = candles;
      // Сохраняем сформированные пропущенные свечи
      if (gappedCandles) await saveCandlesArrayToCache(gappedCandles);
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
  async batchCandles() {
    try {
      // Если не нужно свертывать свечи - выходим
      if (!this._requireBatching) return;
      // Инициализируем объект со свечами в различных таймфреймах
      this._timeframeCandles = {};
      this._timeframes.forEach(timeframe => {
        this._timeframeCandles[timeframe] = [];
      });
      // Список загруженных минут
      const loadedMinutesList = this._cachedCandles.map(candle => candle.time);
      loadedMinutesList.forEach(time => {
        const date = dayjs(time);
        const currentTimeframes = getCurrentTimeframes(this._timeframes, time);
        if (currentTimeframes.length > 0) {
          currentTimeframes.forEach(timeframe => {
            const timeFrom = date.add(-timeframe, "minute").valueOf();
            const timeTo = time;
            const candles = this._cachedCandles.filter(
              candle => candle.time >= timeFrom && candle.time <= timeTo
            );
            if (candles.length > 0) {
              this._timeframeCandles[timeframe].push({
                time, // время в милисекундах
                timestamp: date.toISOString(), // время в ISO UTC
                open: candles[0].open, // цена открытия - цена открытия первой свечи
                high: Math.max(...candles.map(t => t.max)), // максимальная цена
                low: Math.min(...candles.map(t => t.min)), // минимальная цена
                close: candles[candles.length - 1].close, // цена закрытия - цена закрытия последней свечи
                volume: candles.map(t => t.volume).reduce((a, b) => a + b), // объем - сумма объема всех свечей
                count: candles.length,
                gap: candles.length === timeframe,
                type: "created" // признак - свеча сформирована
              });
            }
          });
        }
      });

      await Promise.all(
        this._timeframes.map(async timeframe => {
          try {
            await saveCandlesArray(this._timeframeCandles[timeframe]);
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
        `Failed to batch cached candles`
      );
    }
  }

  getCurrentState() {
    this.log(`getCurrentState()`);
    const state = {
      taskId: this._taskId,
      eventSubject: this._eventSubject,
      mode: this._mode,
      debug: this._debug,
      providerType: this._providerType,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframes: this._timeframes,
      limit: this._limit,
      totalDuration: this._totalDuration,
      completedDuration: this._completedDuration,
      leftDuration: this._leftDuration,
      percent: this._percent,
      dateFrom: this._dateFrom,
      dateTo: this._dateTo,
      nextDate: this._dateNext,
      proxy: this._proxy,
      status: this._status,
      error: this.error,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      metadata: this._metadata
    };
    return state;
  }

  async save() {
    this.log(`save()`);
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
      this.log(`end()`);
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

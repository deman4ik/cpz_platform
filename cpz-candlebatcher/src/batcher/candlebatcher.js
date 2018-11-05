import VError from "verror";
import dayjs from "dayjs";
import { CANDLEBATCHER_SERVICE } from "cpzServices";
import { STATUS_STARTED, STATUS_STOPPED } from "cpzState";
import {
  LOG_CANDLEBATCHER_EVENT,
  CANDLES_NEWCANDLE_EVENT,
  ERROR_CANDLEBATCHER_EVENT,
  CANDLES_TOPIC
} from "cpzEventTypes";
import {
  modeToStr,
  getPreviousMinuteRange,
  getCurrentTimeframes,
  generateKey
} from "cpzUtils/helpers";
import {
  createCandlebatcherSlug,
  createCachedCandleSlug
} from "cpzStorage/utils";
import publishEvents from "cpzEvents";
import {
  saveCandleToCache,
  saveCandlebatcherState,
  getCachedCandles,
  getPrevCachedTicks,
  clearPrevCachedTicks
} from "../tableStorage";
import CryptocompareProvider from "../providers/cryptocompareProvider";
import CCXTProvider from "../providers/ccxtProvider";
/**
 * Класс Candlebatcher
 *
 * @class Candlebatcher
 */
class Candlebatcher {
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
    /* Массив таймфреймов [1,5,30,60,3600] */
    this._timeframes = state.timeframes || [];
    /* Текущие тики */
    this._ticks = [];
    /* Текущие минутные свечи */
    this._candles = [];
    /* Последняя минутная свеча */
    this._lastCandle = state.lastCandle || {};
    /* Объект с последними свечами в различных таймфреймах */
    this._lastCandles = state.lastCandles || {};
    /* Недавно отправленные свечи в различных таймфреймах */
    this._sendedCandles = state.sendedCandles || {};
    /* Адрес прокси сервера */
    this._proxy = state.proxy;
    /* Объект запроса на обновление параметров {debug,proxy,timeframes,eventSubject,providerType} или false */
    this._updateRequested = state.updateRequested || false;
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
      : state.endedAt || ""; // Дата и время остановки
    /* Метаданные стореджа */
    this._metadata = state.metadata;
    /* Запуск инициализациия провайдера */
    this.initProvider();
    this.log(`Candlebatcher ${this._eventSubject} initialized`);
  }

  /**
   * Инициализация функции коннектора
   *
   * @memberof Candlebatcher
   */
  initProvider() {
    this.log(`initProvider()`);
    try {
      const initParams = {
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
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
          name: "CandlebatcherError",
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
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Candlebatcher
   */
  log(...args) {
    if (this._debug) {
      this._context.log.info(`Candlebatcher ${this._eventSubject}:`, ...args);
    }
  }

  /**
   * Логирование в EventGrid в топик CPZ-LOGS
   *
   * @param {*} data
   * @memberof Candlebatcher
   */
  logEvent(data) {
    // Публикуем событие
    publishEvents(LOG_CANDLEBATCHER_EVENT, {
      service: CANDLEBATCHER_SERVICE,
      subject: this._eventSubject,
      eventType: ERROR_CANDLEBATCHER_EVENT,
      data: {
        taskId: this._taskId,
        data
      }
    });
  }

  /**
   * Запрос текущего статуса сервиса
   *
   * @returns status
   * @memberof  Trader
   */
  get status() {
    return this._status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns updateRequested
   * @memberof Trader
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

    if (this._status === STATUS_STOPPED) this._endedAt = dayjs().toJSON();
  }

  /**
   * Установка новых параметров
   *
   * @param {*} [updatedFields=this.updateRequested]
   * @memberof Candlebatcher
   */
  setUpdate(updatedFields = this._updateRequested) {
    this.log(`setStatus()`, updatedFields);
    this._eventSubject = updatedFields.eventSubject || this._eventSubject;
    this._debug = updatedFields.debug || this._debug;
    this._providerType = updatedFields.providerType || this._providerType;
    this._timeframes = updatedFields.timeframes || this._timeframes;
    this._proxy = updatedFields.proxy || this._proxy;
  }

  /**
   * Загрузка новой минутной свечи
   *
   * @returns
   * @memberof Candlebatcher
   */
  async _loadCandle() {
    this.log("loadCandle()");
    try {
      // Вызов функции коннектора
      const result = await this.provider.loadPreviousCandle(this._dateFrom);
      // Если еще не было загруженных свечей или дата загруженный свечи не равна дате текущей свечи
      if (
        !Object.prototype.hasOwnProperty.call(this._lastCandle, "time") ||
        this._lastCandle.time !== result.time
      ) {
        // Сохраняем новую загруженную свечу
        this._loadedCandle = { ...result, type: "loaded" };
      }
    } catch (error) {
      throw new VError(
        {
          name: "CandlebatcherError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to load candle`
      );
    }
  }

  /**
   * Формирование минутной свечи из тиков
   */
  async _createCandle() {
    this.log("createCandle()");
    try {
      /* Считывание тиков за предыдущую минуту */
      this._ticks = await getPrevCachedTicks({
        slug: createCandlebatcherSlug(
          this._exchange,
          this._asset,
          this._currency,
          modeToStr(this._mode)
        ),
        dateFrom: this._dateFrom.toISOString(),
        dateTo: this._dateTo.toISOString()
      });
      /* Если были тики */
      if (this._ticks.length > 0) {
        /* Сортируем тики по дате */
        this._ticks = this._ticks.sort((a, b) => a.time > b.time);
        /* Формируем свечу */
        this._createdCandle = {
          time: this._dateFrom.valueOf(), // время в милисекундах
          timestamp: this._dateFrom.toISOString(), // время в ISO UTC
          open: this._ticks[0].price, // цена открытия - цена первого тика
          high: Math.max(...this._ticks.map(t => t.price)), // максимальная цена тиков
          low: Math.min(...this._ticks.map(t => t.price)), // минимальная цена тиков
          close: this._ticks[this._ticks.length - 1].price, // цена закрытия - цена последнего тика
          volume: this._ticks.map(t => t.volume).reduce((a, b) => a + b), // объем - сумма объема всех тиков
          type: "created" // признак - свеча сформирована
        };
      } else {
        /* Если тиков не было - нельзя сформировать свечу */
        this._createdCandle = null;
      }
    } catch (error) {
      throw new VError(
        {
          name: "CandlebatcherError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to create candle from ticks`
      );
    }
  }

  /**
   * Очистка тиков в Table Storage
   */
  async _clearTicks() {
    this.log("clearTicks()");
    try {
      if (this._ticks.length > 0) {
        await clearPrevCachedTicks(this._ticks);
      }
    } catch (error) {
      throw new VError(
        {
          name: "CandlebatcherError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject,
            dateFrom: this._dateFrom.toISOString(),
            dateTo: this._dateTo.toISOString()
          }
        },
        `Failed to clear ticks`
      );
    }
  }

  /**
   * Обработка свечи
   *
   * @returns
   * @memberof Candlebatcher
   */
  async handleCandle() {
    try {
      this.log("handleCandle()");
      /* Начало и конец предыдущей минуты */
      const { dateFrom, dateTo } = getPreviousMinuteRange();
      this._dateFrom = dateFrom;
      this._dateTo = dateTo;
      /* Пробуем сформировать минутную свечу */
      await this._createCandle();
      this._currentCandle = this._createdCandle;
      /* Если не удалось сформировать */
      if (!this._createdCandle) {
        /* Пробуем загрузить минутную свечу с биржи */
        await this._loadCandle();
        this._currentCandle = this._loadedCandle;
      }
      /* Если не удалось сформировать и загрузить минутную свечу */
      if (!this._currentCandle) {
        /* Если есть предыдущая свеча */
        if (this._lastCandle) {
          /* Формируем новую свечу по данным из предыдущей */
          this._currentCandle = {
            time: this._dateFrom.valueOf(), // время в милисекундах
            timestamp: this._dateFrom.toISOString(), // время в ISO UTC
            open: this._lastCandle.close, // цена открытия = цене закрытия предыдущей
            high: this._lastCandle.close, // максимальная цена = цене закрытия предыдущей
            low: this._lastCandle.close, // минимальная цена = цене закрытия предыдущей
            close: this._lastCandle.close, // цена закрытия = цене закрытия предыдущей
            volume: 0, // нулевой объем
            type: "previous" // признак - предыдущая
          };
        }
      }
      /* Если есть текущая свеча */
      if (this._currentCandle) {
        this._timeframeCandles = {};
        this._events = [];
        this._timeframeCandles[1] = this._currentCandle;
        this.log(this._currentCandle);
        /* Проверяем какие таймфреймы возможно сформировать */
        const currentTimeframes = getCurrentTimeframes(
          this._timeframes,
          this._dateFrom
        );
        if (currentTimeframes.length > 0) {
          /* Загружаем максимальный период из кэша */
          const maxTimeframe = currentTimeframes[0];
          const loadDateFrom = this._dateFrom.add(-maxTimeframe, "minute");
          const loadedCandles = await getCachedCandles({
            dateFrom: loadDateFrom,
            dateTo: this._dateTo,
            slug: createCachedCandleSlug(
              this._exchange,
              this._asset,
              this._currency,
              maxTimeframe,
              this._mode
            )
          });
          /* Заполняем массив свечей - загруженные + текущая и сортируем по дате */
          this._candles = [...loadedCandles, this._currentCandle].sort(
            (a, b) => a.time > b.time
          );

          /* Формируем свечи в необходимых таймфреймах */
          currentTimeframes.forEach(timeframe => {
            const timeFrom = this._dateFrom.add(-timeframe, "minute").valueOf();
            const timeTo = this._dateFrom.valueOf();
            const candles = this._candles.filter(
              candle => candle.time >= timeFrom && candle.time <= timeTo
            );
            if (candles.length > 0) {
              if (candles.length !== timeframe) {
                // TODO Check gap
              }
              this._timeframeCandles[timeframe] = {
                time: this._dateFrom.valueOf(), // время в милисекундах
                timestamp: this._dateFrom.toISOString(), // время в ISO UTC
                open: candles[0].open, // цена открытия - цена открытия первой свечи
                high: Math.max(...candles.map(t => t.max)), // максимальная цена
                low: Math.min(...candles.map(t => t.min)), // минимальная цена
                close: candles[candles.length - 1].close, // цена закрытия - цена закрытия последней свечи
                volume: candles.map(t => t.volume).reduce((a, b) => a + b), // объем - сумма объема всех свечей
                count: candles.length,
                gap: candles.length === timeframe,
                type: "created" // признак - свеча сформирована
              };
            } else {
              this._timeframeCandles[timeframe] = null;
            }
          });
        }

        /* Для всех сформированных свечей  */
        Object.keys(this._timeframeCandles).forEach(async timeframe => {
          /* Инициализируем полный объект свечи */
          const candle = {
            id: generateKey(),
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency,
            mode: this._mode,
            timeframe,
            ...this._timeframeCandles[timeframe]
          };
          /* Если подписаны на данный таймфрейм */
          if (this._timeframes.includes(timeframe)) {
            try {
              /* Отправляем событие */
              await publishEvents(CANDLES_TOPIC, {
                service: CANDLEBATCHER_SERVICE,
                subject: this.createSubject(timeframe),
                eventType: CANDLES_NEWCANDLE_EVENT,
                data: candle
              });
              this._sendedCandles.push(candle);
            } catch (error) {
              throw new VError(
                {
                  name: "CandlebatcherError",
                  cause: error,
                  info: {
                    taskId: this._taskId,
                    eventSubject: this._eventSubject,
                    candle
                  }
                },
                `Failed to publish candle event`
              );
            }
          }
          try {
            await saveCandleToCache();
          } catch (error) {
            throw new VError(
              {
                name: "CandlebatcherError",
                cause: error,
                info: {
                  taskId: this._taskId,
                  eventSubject: this._eventSubject,
                  candle
                }
              },
              `Failed to save candle to cache`
            );
          }
        });
      }

      this._lastCandle = this._currentCandle;
      await this._clearTicks();
      // TODO: Clear outdated Cache
    } catch (error) {
      throw new VError(
        {
          name: "CandlebatcherError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        `Failed to handle new candle`
      );
    }
  }

  /**
   * Генерация темы события NewCandle
   *
   * @param {*} timeframe
   * @returns
   * @memberof Candlebatcher
   */
  createSubject(timeframe) {
    return `${this._exchange}/${this._asset}/${this._currency}/${timeframe ||
      JSON.stringify(this._timeframes)}/${this._taskId}.${modeToStr(
      this._mode
    )}`;
  }

  /**
   * Запрос всего текущего состояния
   *
   * @returns
   * @memberof Candlebatcher
   */
  getCurrentState() {
    return {
      taskId: this._taskId,
      eventSubject: this._eventSubject,
      mode: this._mode,
      debug: this._debug,
      providerType: this._providerType,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframes: this._timeframes,
      lastCandle: this._lastCandle,
      sendedCandles: this._sendedCandles,
      proxy: this._proxy,
      status: this._status,
      error: this.error,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      metadata: this._metadata
    };
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Candlebatcher
   */
  async save() {
    this.log(`save()`);
    try {
      // Сохраняем состояние в локальном хранилище
      await saveCandlebatcherState(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "CandlebatcherError",
          cause: error,
          info: {
            taskId: this._taskId,
            eventSubject: this._eventSubject
          }
        },
        'Failed to update strategy "%s" state',
        this._strategyName
      );
    }
  }

  /**
   * Завершение работы итерации
   *
   * @param {*} status
   * @param {*} error
   * @memberof Candlebatcher
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
            name: "CandlebatcherError",
            cause: err,
            info: {
              taskId: this._taskId,
              eventSubject: this._eventSubject
            }
          },
          'Failed to end candlabatcher execution "%s"',
          this._taskId
        );
      }
    }
  }
}

export default Candlebatcher;

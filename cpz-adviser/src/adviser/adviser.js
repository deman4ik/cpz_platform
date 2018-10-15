import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import VError from "verror";
import { ADVISER_SERVICE } from "cpzServices";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_FINISHED,
  INDICATORS_BASE,
  INDICATORS_TULIP
} from "cpzState";
import publishEvents from "cpzEvents";
import {
  SIGNALS_NEWSIGNAL_EVENT,
  LOG_ADVISER_EVENT,
  LOG_TOPIC
} from "cpzEventTypes";
import { modeToStr } from "cpzUtils/helpers";
import { REQUIRED_HISTORY_MAX_BARS } from "cpzDefaults";
import BaseStrategy from "./baseStrategy";
import BaseIndicator from "./baseIndicator";
import TulipIndicatorClass from "../lib/tulip/tulipIndicators";
import { getCachedCandlesByKey, saveAdviserState } from "../tableStorage";

/**
 * Класс советника
 *
 * @class Adviser
 */
class Adviser {
  /**
   * Конструктор
   * @param {Object} context
   * @param {Object} state
   */
  constructor(context, state) {
    /* Текущий контекст выполнения */
    this._context = context;
    /* Тема события */
    this._eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Идентификатор робота */
    this._robotId = state.robotId;
    /* Режим работы ['backtest', 'emulator', 'realtime'] */
    this._mode = state.mode;
    /* Режима дебага [true,false] */
    this._debug = state.debug || false;
    /* Объект настроек из веб-интерфейса */
    this._settings = state.settings || {};
    /* Код биржи */
    this._exchange = state.exchange;
    /* Идентификатор биржи */
    this._exchangeId = state.exchangeId;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Таймфрейм */
    this._timeframe = state.timeframe;
    /* Имя файла стратегии */
    this._strategyName = state.strategyName;
    /* Загружать историю из кэша */
    this._requiredHistoryCache = state.requiredHistoryCache || true;
    /* Максимально количество свечей в кэше */
    this._requiredHistoryMaxBars =
      state.requiredHistoryMaxBars || REQUIRED_HISTORY_MAX_BARS;
    /* Состояне стратегии */
    this._strategy = state.strategy || { variables: {}, initialized: false };
    /* Состояние индикаторов */
    this._indicators = state.indicators || {};
    /* Текущая свеча */
    this._candle = {};
    /* Последняя свеча */
    this._lastCandle = state.lastCandle || {};
    /* Массив сигналов к отправке */
    this._signals = [];
    /* Массив последних сигналов */
    this._lastSignals = state.lastSignals || [];
    /* Объект запроса на обновление параметров {debug,proxy,timeframes,eventSubject} или false */
    this._updateRequested = state.updateRequested || false;
    /* Признак запроса на остановку сервиса [true,false] */
    this._stopRequested = state.stopRequested || false;
    /* Текущий статус сервиса */
    this._status = this._stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED;
    /* Дата и время запуска */
    this._startedAt = state.startedAt || dayjs().toJSON();
    /* Дата и время остановки */
    this._endedAt = this._stopRequested
      ? dayjs().toJSON()
      : state.endedAt || "";
    /* Признак выполнения инициализации */
    this._initialized = state.initialized || false;
    /* Метаданные стореджа */
    this._metadata = state.metadata;

    /* Запуск загрузки стратегии */
    this.loadStrategy();
    /* Запуск загрузки индикаторов */
    this.loadIndicators();
    /* Если инициализация не выполнялась */
    if (!this._initialized) {
      /* Запуск инициализации стратегии */
      this.initStrategy();
      this._initialized = true;
    }
  }

  /**
   * Запрос текущего статуса сервиса
   *
   * @returns status
   * @memberof Adviser
   */
  get status() {
    return this._status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns updateRequested
   * @memberof Adviser
   */
  get updateRequested() {
    return this._updateRequested;
  }

  /**
   * Запрос текущих событий для отправки
   *
   * @memberof Adviser
   */
  get events() {
    return this._signals;
  }

  /**
   * Установка статуса сервиса
   *
   * @param {*} status
   * @memberof Adviser
   */
  set status(status) {
    if (status) this._status = status;
    if (this._status === STATUS_STOPPED || this._status === STATUS_FINISHED)
      this._endedAt = dayjs().toJSON();
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Adviser
   */
  log(...args) {
    if (this._debug) {
      this._context.log.info(`Adviser ${this._eventSubject}:`, ...args);
    }
  }

  /**
   * Логирование в EventGrid в топик CPZ-LOGS
   *
   * @param {*} data
   * @memberof Adviser
   */
  logEvent(data) {
    // Публикуем событие
    publishEvents(this._context, LOG_TOPIC, {
      service: ADVISER_SERVICE,
      subject: this._eventSubject,
      eventType: LOG_ADVISER_EVENT,
      data: {
        taskId: this._taskId,
        data
      }
    });
  }

  /**
   * Аварийная остановка советника
   *
   * @param {*} msg
   * @memberof Adviser
   */
  crash(msg) {
    this.log("crash()");
    throw new VError(
      {
        name: "AdviserCrachError"
      },
      'Error while executing strategy "%s" - "%d"',
      this._strategyName,
      msg
    );
  }

  /**
   * Загрузка стратегии
   *
   * @memberof Adviser
   */
  loadStrategy() {
    this.log("loadStrategy()");
    try {
      // Считываем стратегию
      /* eslint-disable import/no-dynamic-require, global-require */
      const strategyObject = require(`../strategies/${this._strategyName}`);
      /* import/no-dynamic-require, global-require */
      const strategyFunctions = {};
      Object.getOwnPropertyNames(strategyObject)
        .filter(key => typeof strategyObject[key] === "function")
        .forEach(key => {
          strategyFunctions[key] = strategyObject[key];
        });
      // Создаем новый инстанс класса стратегии
      this._strategyInstance = new BaseStrategy({
        initialized: this._strategy._initialized,
        settings: this._settings,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        advice: this.advice.bind(this), // функция advise -> adviser.advise
        log: this.log.bind(this), // функция log -> advise.log
        logEvent: this.logEvent.bind(this), // функция logEvent -> advise.logEvent
        crash: this.crash.bind(this), // функция crash -> adviser.crash
        strategyFunctions, // функции стратегии
        ...this._strategy // предыдущий стейт стратегии
      });
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to load strategy "%s"',
        this._strategyName
      );
    }
  }

  /**
   *  Загрузка индикаторов
   *
   * @memberof Adviser
   */
  loadIndicators() {
    this.log("loadIndicators()");
    try {
      // Идем по всем свойствам в объекте индикаторов
      Object.keys(this._indicators).forEach(key => {
        // Считываем индикатор по ключу
        const indicator = this._indicators[key];
        // В зависимости от типа индикатора
        switch (indicator.type) {
          case INDICATORS_BASE: {
            // Если базовый индикатор
            try {
              // Считываем объект индикатора
              /* eslint-disable import/no-dynamic-require, global-require */
              const indicatorObject = require(`../indicators/${
                indicator.fileName
              }`);
              /* import/no-dynamic-require, global-require */
              // Берем все функции индикатора
              const indicatorFunctions = {};
              Object.getOwnPropertyNames(indicatorObject)
                .filter(
                  ownProp => typeof indicatorObject[ownProp] === "function"
                )
                .forEach(ownProp => {
                  indicatorFunctions[ownProp] = indicatorObject[ownProp];
                });
              // Создаем новый инстанc базового индикатора
              this[`_ind${key}Instance`] = new BaseIndicator({
                exchange: this._exchange,
                asset: this._asset,
                currency: this._currency,
                timeframe: this._timeframe,
                log: this.log.bind(this), // функция log -> advise.log
                logEvent: this.logEvent.bind(this), // функция logEvent -> advise.logEvent
                indicatorFunctions, // функции индикатора
                ...indicator // стейт индикатора
              });
            } catch (err) {
              throw new VError(
                {
                  name: "AdviserIndicatorError",
                  cause: err,
                  info: {
                    indicator: key
                  }
                },
                'Failed to load indicator "%s"',
                key
              );
            }
            break;
          }
          case INDICATORS_TULIP: {
            // Если внешний индикатор Tulip
            try {
              // Создаем новый инстанc индикатора Tulip
              this[`_ind${key}Instance`] = new TulipIndicatorClass({
                exchange: this._exchange,
                asset: this._asset,
                currency: this._currency,
                timeframe: this._timeframe,
                options: indicator.options,
                log: this.log.bind(this), // функция log -> advise.log
                logEvent: this.logEvent.bind(this), // функция logEvent -> advise.logEvent
                ...indicator // стейт индикатора
              });
            } catch (err) {
              throw new VError(
                {
                  name: "AdviserIndicatorError",
                  cause: err,
                  info: {
                    indicator: key
                  }
                },
                'Failed to load Tulip indicator "%s"',
                key
              );
            }
            break;
          }
          default:
            // Неизвестный тип индикатора - ошибка
            throw new Error(`Unknown indicator type ${indicator.type}`);
        }
      });
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to load indicators for strategy "%s"',
        this._strategyName
      );
    }
  }

  /**
   * Инициализация стратегии
   *
   * @memberof Adviser
   */
  initStrategy() {
    this.log("initStrategy()");
    try {
      // Если стратегия еще не проинициализирована
      if (!this._strategyInstance.initialized) {
        // Инициализируем
        this._strategyInstance.init();
        this._strategyInstance.initialized = true;
        // Считываем настройки индикаторов
        this._indicators = this._strategyInstance.indicators;
        // Загружаем индикаторы
        this.loadIndicators();
        // Инициализируем индикаторы
        this.initIndicators();
      }
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to initialize strategy "%s"',
        this._strategyName
      );
    }
  }

  /**
   * Инициализация индикаторов
   *
   * @memberof Adviser
   */
  initIndicators() {
    this.log("initIndicators()");
    try {
      Object.keys(this._indicators).forEach(key => {
        this.log(key);
        try {
          if (!this[`_ind${key}Instance`].initialized) {
            this[`_ind${key}Instance`].init();
            this[`_ind${key}Instance`].initialized = true;
          }
        } catch (err) {
          throw new VError(
            {
              name: "AdviserIndicatorError",
              cause: err,
              info: {
                indicator: key
              }
            },
            'Failed to initialize indicator "%s"',
            key
          );
        }
      });
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to initialize indicators for strategy "%s"',
        this._strategyName
      );
    }
  }

  /**
   * Пересчет индикаторов
   *
   * @memberof Adviser
   */
  async calcIndicators() {
    this.log("calcIndicators()");
    try {
      await Promise.all(
        Object.keys(this._indicators).map(async key => {
          try {
            this[`_ind${key}Instance`].handleCandle(
              this._candle,
              this._candles,
              this._candlesProps
            );
            await this[`_ind${key}Instance`].calc();
          } catch (err) {
            throw new VError(
              {
                name: "AdviserIndicatorError",
                cause: err,
                info: {
                  indicator: key
                }
              },
              'Failed to calculate indicator "%s"',
              key
            );
          }
        })
      );
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to calculate indicators for strategy "%s"',
        this._strategyName
      );
    }
  }

  /**
   * Запуск основной функции стратегии
   *
   * @memberof Adviser
   */
  runStrategy() {
    try {
      // Передать свечу и значения индикаторов в инстанс стратегии
      this._strategyInstance.handleCandle(this._candle, this._indicators);
      // Запустить проверку стратегии
      this._strategyInstance.check();
    } catch (error) {
      throw new VError(
        {
          name: "AdviserStrategyError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to run strategy "%s"',
        this._strategyName
      );
    }
  }

  /**
   * Загрузка свечей из кэша
   *
   * @memberof Adviser
   */
  async _loadCandles() {
    try {
      const cachedCandles = await getCachedCandlesByKey(
        `${this._exchange}.${this._asset}.${this._currency}.${this._timeframe}`,
        this._requiredHistoryMaxBars
      );

      this._candles = cachedCandles.reverse();
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to load candles from cache for strategy "%s"',
        this._strategyName
      );
    }
  }

  /**
   * Преобразование свечей для индикаторов
   *
   * @memberof Adviser
   */
  _prepareCandles() {
    this._candlesProps = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: []
    };
    this._candles.forEach(candle => {
      this._candlesProps.open.push(candle.open);
      this._candlesProps.high.push(candle.high);
      this._candlesProps.low.push(candle.low);
      this._candlesProps.close.push(candle.close);
      this._candlesProps.volume.push(candle.volume);
    });
  }

  /**
   * Обработка новой свечи
   *
   * @param {*} candle
   * @memberof Adviser
   */
  async handleCandle(candle) {
    try {
      this.log("handleCandle()");

      // Обновить текущую свечу
      this._candle = candle;
      // Если  свеча уже обрабатывалась - выходим
      if (this._candle.candleId === this._lastCandle.candleId) return;
      // Если нужна история
      if (this._requiredHistoryCache) {
        // Загрузить свечи из кеша
        await this._loadCandles();
      } else {
        // Обрабатываем только текущую свечу
        this._candles.push(this._candle);
      }
      // Подготовить свечи для индикаторов
      this._prepareCandles();
      // Рассчитать значения индикаторов
      await this.calcIndicators();
      // Считать текущее состояние индикаторов
      this.getIndicatorsState();

      // Запуск стратегии
      this.runStrategy();
      // Обработанная свеча
      this._lastCandle = this._candle;
      // Сгенерированные сигналы
      this._lastSignals = this._signals;
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to handle new candle for strategy "%s"',
        this._strategyName
      );
    }
  }

  /**
   * Генерация темы события NewSignal
   *
   * @returns subject
   * @memberof Candlebatcher
   */
  _createSubject() {
    return `${this._exchange}/${this._asset}/${this._currency}/${
      this._timeframe
    }/${this._taskId}.${modeToStr(this._mode)}`;
  }

  /**
   * Генерация события NewSignal
   *
   * @param {*} signal
   * @memberof Adviser
   */
  advice(signal) {
    this.log("advice()");
    const newSignal = {
      signalId: uuid(),
      dataVersion: "1.0",
      eventTime: new Date(),
      subject: this._createSubject(),
      eventType: SIGNALS_NEWSIGNAL_EVENT.eventType,
      data: {
        id: uuid(),
        robotId: this._robotId,
        advisorId: this._taskId,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        service: ADVISER_SERVICE,
        ...signal
      }
    };
    this._signals = [];
    this._signals.push(newSignal);
  }

  /**
   * Запрос текущего состояния индикаторов
   *
   * @memberof Adviser
   */
  getIndicatorsState() {
    this.log("getIndicatorsState()");
    try {
      Object.keys(this._indicators).forEach(ind => {
        this._indicators[ind].initialized = this[
          `_ind${ind}Instance`
        ].initialized;
        this._indicators[ind].options = this[`_ind${ind}Instance`].options;
        // Все свойства инстанса стратегии
        Object.keys(this[`_ind${ind}Instance`])
          .filter(key => !key.startsWith("_")) // публичные (не начинаются с "_")
          .forEach(key => {
            if (typeof this[`_ind${ind}Instance`][key] !== "function")
              this._indicators[ind].variables[key] = this[`_ind${ind}Instance`][
                key
              ]; // сохраняем каждое свойство
          });
      });
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to find indicators state for strategy "%s"',
        this._strategyName
      );
    }
  }

  /**
   * Запрос текущего состояния стратегии
   *
   * @memberof Adviser
   */
  getStrategyState() {
    try {
      this._strategy.initialized = this._strategyInstance.initialized;
      // Все свойства инстанса стратегии
      Object.keys(this._strategyInstance)
        .filter(key => !key.startsWith("_")) // публичные (не начинаются с "_")
        .forEach(key => {
          if (typeof this._strategyInstance[key] !== "function")
            this._strategy.variables[key] = this._strategyInstance[key]; // сохраняем каждое свойство
        });
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
          }
        },
        'Failed to find strategy "%s" state ',
        this._strategyName
      );
    }
  }

  /**
   * Запрос всего текущего состояния
   *
   * @returns {object}
   * @memberof Adviser
   */
  getCurrentState() {
    this.getIndicatorsState();
    this.getStrategyState();
    return {
      eventSubject: this._eventSubject,
      taskId: this._taskId,
      robotId: this._robotId,
      mode: this._mode,
      debug: this._debug,
      settings: this._settings,
      exchange: this._exchange,
      exchangeId: this._exchangeId,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      lastCandle: this._lastCandle,
      lastSignals: this._lastSignals,
      strategyName: this._strategyName,
      strategy: this._strategy,
      indicators: this._indicators,
      updateRequested: this._updateRequested,
      stopRequested: this._stopRequested,
      status: this._status,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      initialized: this._initialized,
      metadata: this._metadata
    };
  }

  /**
   * Установка новых параметров
   *
   * @param {object} [updatedFields=this._updateRequested]
   * @memberof Adviser
   */
  setUpdate(updatedFields = this._updateRequested) {
    this.log(`setUpdate()`, updatedFields);
    this._eventSubject = updatedFields.eventSubject || this._eventSubject;
    this._debug = updatedFields.debug || this._debug;
    this._settings = updatedFields.settings || this._settings;
    this._requiredHistoryCache =
      updatedFields.requiredHistoryCache || this._requiredHistoryCache;
    this._requiredHistoryMaxBars =
      updatedFields.requiredHistoryMaxBars || this._requiredHistoryMaxBars;
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Adviser
   */
  async save() {
    this.log(`save()`);
    try {
      // Сохраняем состояние в локальном хранилище
      await saveAdviserState(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            eventSubject: this._eventSubject,
            strategyName: this._strategyName
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
   * @memberof Adviser
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
            name: "AdviserError",
            cause: error
          },
          'Failed to end adviser execution for strategy "%s"',
          this._strategyName
        );
      }
    }
  }
}

export default Adviser;

import dayjs from "cpz/utils/dayjs";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import {
  createAdviserSlug,
  INDICATORS_BASE,
  INDICATORS_TULIP,
  STATUS_PENDING,
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_PAUSED,
  STATUS_ERROR,
  ATTENTION_SUBJECT
} from "cpz/config/state";
import {
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_UPDATED_EVENT
} from "cpz/events/types/tasks/adviser";
import { ERROR_ADVISER_ERROR_EVENT } from "cpz/events/types/error";
import { combineAdviserSettings } from "cpz/utils/settings";
import BaseStrategy from "./baseStrategy";
import BaseIndicator from "./baseIndicator";
import TulipIndicatorClass from "../lib/tulip/tulipIndicators";

/**
 * Класс советника
 *
 * @class Adviser
 */
class Adviser {
  constructor(state) {
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Идентификатор робота */
    this._robotId = state.robotId;
    /* Код биржи */
    this._exchange = state.exchange;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Таймфрейм */
    this._timeframe = state.timeframe;
    /* Имя файла стратегии */
    this._strategyName = state.strategyName;

    this._PartitionKey =
      state.PartitionKey ||
      createAdviserSlug({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe
      });
    /* Настройки */
    this._settings = combineAdviserSettings(state.settings);
    /* Последняя свеча */
    this._lastCandle = state.lastCandle || { id: null };
    /* Состояне стратегии */
    this._strategy = state.strategy || {
      variables: {},
      positions: {},
      initialized: false
    };
    /* Действия для проверки */
    this._hasActions = state.hasActions || false;
    /* Состояние индикаторов */
    this._indicators = state.indicators || {};
    this._baseIndicatorsCode = {};
    /* Текущая свеча */
    this._candle = {};
    /* Текущие свечи */
    this._candles = [];

    /* Текущий статус сервиса */
    this._status = state.status || STATUS_PENDING;
    /* Дата и время запуска */
    this._startedAt = state.startedAt;
    this._stoppedAt = state.stoppedAt;

    this._eventsToSend = {};
  }

  log(...args) {
    if (this._settings.debug) {
      Log.debug(`Adviser ${this._robotId}`, ...args);
    }
  }

  get taskId() {
    return this._taskId;
  }

  get events() {
    return Object.values(this._eventsToSend);
  }

  start() {
    this.log(STATUS_STARTED);
    this._status = STATUS_STARTED;
    this._startedAt = dayjs.utc().toISOString();
    this._eventsToSend.Start = {
      eventType: TASKS_ADVISER_STARTED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      }
    };
  }

  stop() {
    this.log(STATUS_STOPPED);
    this._status = STATUS_STOPPED;
    this._stoppedAt = dayjs.utc().toISOString();
    this._error = null;
    this._eventsToSend.Stop = {
      eventType: TASKS_ADVISER_STOPPED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      }
    };
  }

  update(settings) {
    this.log("updated");
    this._settings = combineAdviserSettings(settings);
    this._eventsToSend.Update = {
      eventType: TASKS_ADVISER_UPDATED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      }
    };
  }

  pause() {
    this._status = STATUS_PAUSED;
  }

  setError(err) {
    try {
      let critical;
      if (err instanceof ServiceError) {
        ({ critical = false } = err.info);
        this._error = err.json;
      } else {
        critical = true;
        this._error = new ServiceError(
          {
            name: ServiceError.types.ADVISER_ERROR,
            cause: err,
            info: { ...this.props }
          },
          "Adviser '%s' error",
          this._taskId
        ).json;
      }
      if (critical) this._status = STATUS_ERROR;

      this._eventsToSend.error = this._createErrorEvent(this._error);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_SET_ERROR_ERROR,
          cause: e
        },
        "Failed to set error"
      );
    }
  }

  _createErrorEvent(error) {
    const { critical = false } = error.info;
    return {
      eventType: ERROR_ADVISER_ERROR_EVENT,
      eventData: {
        subject: ATTENTION_SUBJECT,
        data: {
          taskId: this._taskId,
          critical,
          error
        }
      }
    };
  }

  get status() {
    return this._status;
  }

  set status(status) {
    this._status = status;
  }

  get lastCandle() {
    return this._lastCandle;
  }

  get settings() {
    return this._settings;
  }

  get hasActions() {
    return this._hasActions;
  }

  get hasBaseIndicators() {
    return Object.values(this._indicators).filter(
      ({ type }) => type === INDICATORS_BASE
    );
  }

  get baseIndicatorsFileNames() {
    return Object.values(this._indicators)
      .filter(({ type }) => type === INDICATORS_BASE)
      .map(({ fileName }) => fileName);
  }

  setBaseIndicatorsCode(baseIndicators) {
    baseIndicators.forEach(({ fileName, code }) => {
      this._baseIndicatorsCode[fileName] = code;
    });
  }

  setStrategy(strategyCodeProp, strategyStateProp) {
    try {
      const strategyCode = strategyCodeProp || {};
      const strategyState = strategyStateProp || this._strategy;
      // Функции стратегии
      const strategyFunctions = {};
      Object.getOwnPropertyNames(strategyCode)
        .filter(key => typeof strategyCode[key] === "function")
        .forEach(key => {
          strategyFunctions[key] = strategyCode[key];
        });
      // Схема параметров
      const { parametersSchema } = strategyCode;

      // Создаем новый инстанс класса стратегии
      this._strategyInstance = new BaseStrategy({
        initialized: strategyState.initialized,
        parameters: this._settings.strategyParameters,
        adviserSettings: this._settings,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        robotId: this._robotId,
        posLastNumb: strategyState.posLastNumb,
        positions: strategyState.positions,
        parametersSchema,
        strategyFunctions, // функции стратегии
        ...strategyState // предыдущий стейт стратегии
      });
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_ERROR,
          cause: error,
          info: {
            ...this.props
          }
        },
        'Failed to set strategy "%s"',
        this._strategyName
      );
    }
  }

  set indicatorsState(indicatorsState) {
    this._indicators = indicatorsState;
  }

  /**
   *  Загрузка индикаторов
   *
   * @memberof Adviser
   */
  setIndicators() {
    try {
      // Идем по всем свойствам в объекте индикаторов
      Object.keys(this._indicators).forEach(key => {
        // Считываем индикатор по ключу
        const indicator = this._indicators[key];
        // В зависимости от типа индикатора
        switch (indicator.type) {
          case INDICATORS_BASE: {
            // Если базовый индикатор

            // Считываем объект индикатора

            const indicatorCode = this._baseIndicatorsCode[
              `${indicator.fileName}`
            ];
            // Берем все функции индикатора
            const indicatorFunctions = {};
            Object.getOwnPropertyNames(indicatorCode)
              .filter(ownProp => typeof indicatorCode[ownProp] === "function")
              .forEach(ownProp => {
                indicatorFunctions[ownProp] = indicatorCode[ownProp];
              });

            // Схема параметров
            const { parametersSchema } = indicatorCode;
            // Создаем новый инстанc базового индикатора
            this[`_ind${key}Instance`] = new BaseIndicator({
              exchange: this._exchange,
              asset: this._asset,
              currency: this._currency,
              timeframe: this._timeframe,
              adviserSettings: this._settings,
              robotId: this._robotId,
              parametersSchema,
              indicatorFunctions, // функции индикатора
              ...indicator // стейт индикатора
            });

            break;
          }
          case INDICATORS_TULIP: {
            // Если внешний индикатор Tulip

            // Создаем новый инстанc индикатора Tulip
            this[`_ind${key}Instance`] = new TulipIndicatorClass({
              exchange: this._exchange,
              asset: this._asset,
              currency: this._currency,
              timeframe: this._timeframe,
              adviserSettings: this._settings,
              robotId: this._robotId,
              parameters: indicator.parameters,
              ...indicator // стейт индикатора
            });

            break;
          }
          /* case INDICATORS_TALIB: {
            // Если внешний индикатор Talib

            // Создаем новый инстанc индикатора Talib
            this[`_ind${key}Instance`] = new TalibIndicatorClass({
              exchange: this._exchange,
              asset: this._asset,
              currency: this._currency,
              timeframe: this._timeframe,
              adviserSettings: this._settings,
              robotId: this._robotId,
              parameters: indicator.parameters,
              ...indicator // стейт индикатора
            });

            break;
          }
          case INDICATORS_TECH: {
            // Если внешний индикатор Tech

            // Создаем новый инстанc индикатора Tech
            this[`_ind${key}Instance`] = new TechInicatatorClass({
              exchange: this._exchange,
              asset: this._asset,
              currency: this._currency,
              timeframe: this._timeframe,
              adviserSettings: this._settings,
              robotId: this._robotId,
              parameters: indicator.parameters,
              ...indicator // стейт индикатора
            });

            break;
          } */
          default:
            // Неизвестный тип индикатора - ошибка
            throw new Error(`Unknown indicator type ${indicator.type}`);
        }
      });
    } catch (error) {
      Log.error(error);
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_ERROR,
          cause: error,
          info: {
            ...this.props
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
    try {
      // Если стратегия еще не проинициализирована
      if (!this._strategyInstance.initialized) {
        // Инициализируем
        this._strategyInstance._checkParameters();
        this._strategyInstance.init();
        this._strategyInstance.initialized = true;
        // Считываем настройки индикаторов
        this._indicators = this._strategyInstance.indicators;
      }
      this.getStrategyState();
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_ERROR,
          cause: error,
          info: {
            ...this.props
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
    try {
      Object.keys(this._indicators).forEach(key => {
        if (!this[`_ind${key}Instance`].initialized) {
          this[`_ind${key}Instance`]._checkParameters();
          this[`_ind${key}Instance`].init();
          this[`_ind${key}Instance`].initialized = true;
        }
      });
      this.getIndicatorsState();
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_ERROR,
          cause: error,
          info: {
            ...this.props
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
    try {
      await Promise.all(
        Object.keys(this._indicators).map(async key => {
          this[`_ind${key}Instance`]._eventsToSend = {};
          this[`_ind${key}Instance`].handleCandles(
            this._candle,
            this._candles,
            this._candlesProps
          );
          await this[`_ind${key}Instance`].calc();
        })
      );
      this.getIndicatorsState();
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.ADVISER_ERROR,
          cause: error,
          info: {
            ...this.props
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
      this._strategyInstance.handleCandles(
        this._candle,
        this._candles,
        this._candlesProps
      );
      this._strategyInstance.handleIndicators(this._indicators);
      // Очищаем предыдущие  задачи у позиций
      this._strategyInstance._clearActions();
      // Запустить проверку стратегии
      this._strategyInstance.check();
      this.getStrategyState();
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_STRATEGY_ERROR,
          cause: error,
          info: {
            ...this.props
          }
        },
        'Failed to run strategy "%s"',
        this._strategyName
      );
    }
  }

  runActions() {
    try {
      // Передать свечу и значения индикаторов в инстанс стратегии
      this._strategyInstance.handleCandles(
        this._candle,
        this._candles,
        this._candlesProps
      );
      // Запустить проверку стратегии
      this._strategyInstance._runActions();
      this.getStrategyState();
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_ACTIONS_ERROR,
          cause: error,
          info: {
            ...this.props
          }
        },
        'Failed to run strategy actions "%s"',
        this._strategyName
      );
    }
  }

  handleCachedCandles(candles) {
    this._candles = [...new Set([...candles])];
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

  handleCandle(candle) {
    this.log("new candle", JSON.stringify(candle));
    if (candle.id === this._lastCandle.id) return;
    if (this._candles.filter(({ id }) => id === candle.id).length === 0) {
      this._candles = [...new Set([...this._candles, candle])];
    }
    this._candle = candle;
    if (!this._lastCandle.id && this._candles.length > 1)
      this._lastCandle = this._candles[this._candles.length - 2];
    this._prepareCandles();
  }

  handleCurrentCandle(candle) {
    this._candle = candle;
  }

  finalize() {
    this._lastCandle = this._candle;
    // TODO: Send Candles.Handled Event
  }

  /**
   * Запрос текущего состояния индикаторов
   *
   * @memberof Adviser
   */
  getIndicatorsState() {
    try {
      Object.keys(this._indicators).forEach(ind => {
        this._eventsToSend = {
          ...this._eventsToSend,
          ...this[`_ind${ind}Instance`]._events
        };
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
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_ERROR,
          cause: error,
          info: {
            ...this.props
          }
        },
        'Failed to get indicators state for strategy "%s"',
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
      this._eventsToSend = {
        ...this._eventsToSend,
        ...this._strategyInstance._events
      };
      this._strategy.initialized = this._strategyInstance.initialized;
      this._strategy.positions = this._strategyInstance.validPositions;
      this._strategy.posLastNumb = this._strategyInstance.posLastNumb;
      this._hasActions = this._strategyInstance.hasActions;
      // Все свойства инстанса стратегии
      Object.keys(this._strategyInstance)
        .filter(key => !key.startsWith("_")) // публичные (не начинаются с "_")
        .forEach(key => {
          if (typeof this._strategyInstance[key] !== "function")
            this._strategy.variables[key] = this._strategyInstance[key]; // сохраняем каждое свойство
        });
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_ERROR,
          cause: error,
          info: {
            ...this.props
          }
        },
        'Failed to get strategy "%s" state ',
        this._strategyName
      );
    }
  }

  get state() {
    return {
      PartitionKey: this._PartitionKey,
      RowKey: this._taskId,
      taskId: this._taskId,
      robotId: this._robotId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      strategyName: this._strategyName,
      settings: this._settings,
      lastCandle: this._lastCandle,
      hasActions: this._hasActions,
      status: this._status,
      startedAt: this._startedAt,
      stoppedAt: this._stoppedAt
    };
  }

  get props() {
    return {
      taskId: this._taskId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      robotId: this._robotId,
      strategyName: this._strategyName
    };
  }

  get strategy() {
    return this._strategy;
  }

  get indicators() {
    return this._indicators;
  }
}

export default Adviser;

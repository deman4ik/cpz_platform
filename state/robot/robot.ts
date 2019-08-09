import { cpz } from "../../types/cpz";
import dayjs from "../../lib/dayjs";
import { Errors } from "moleculer";
import BaseStrategy from "./robot_strategy";
import BaseIndicator from "./robot_indicator";
import TulipIndicatorClass from "../../lib/tulip/tulipIndicators";

class Robot {
  [key: string]: any;
  _robotId: string;
  _exchange: string;
  _asset: string;
  _currency: string;
  _timeframe: cpz.Timeframe;
  _strategyName: string;
  _settings: { [key: string]: any };
  _lastCandle: cpz.Candle;
  _strategy: {
    variables: { [key: string]: any };
    positions: cpz.RobotPositionState[];
    posLastNumb?: { [key: string]: number };
    initialized: boolean;
  };
  _strategyInstance: cpz.Strategy;
  _indicatorInstances: { [key: string]: cpz.Indicator };
  _hasAlerts: boolean;
  _indicators: { [key: string]: cpz.IndicatorState };
  _baseIndicatorsCode: { [key: string]: cpz.IndicatorCode };
  _candle: cpz.Candle;
  _candles: cpz.Candle[];
  _candlesProps: cpz.CandleProps;
  _status: cpz.Status;
  _startedAt: string;
  _stoppedAt: string;
  _eventsToSend: cpz.Events[];
  _error: any;
  _log: (...args: any) => void;

  constructor(state: cpz.RobotState) {
    /* Идентификатор робота */
    this._robotId = state.robot_id;
    /* Код биржи */
    this._exchange = state.exchange;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Таймфрейм */
    this._timeframe = state.timeframe;
    /* Имя файла стратегии */
    this._strategyName = state.strategy_name;

    /* Настройки */
    this._settings = state.settings;
    /* Последняя свеча */
    this._lastCandle = state.last_candle;
    /* Состояне стратегии */
    this._strategy = state.strategy || {
      variables: {},
      positions: [],
      initialized: false
    };
    /* Действия для проверки */
    this._hasAlerts = state.has_alerts || false;
    /* Состояние индикаторов */
    this._indicators = state.indicators || {};
    this._baseIndicatorsCode = {};
    /* Текущая свеча */
    this._candle = null;
    /* Текущие свечи */
    this._candles = [];

    /* Текущий статус сервиса */
    this._status = state.status || cpz.Status.pending;
    /* Дата и время запуска */
    this._startedAt = state.started_at;
    this._stoppedAt = state.stopped_at;

    this._eventsToSend = [];
  }

  get events() {
    return this._eventsToSend;
  }

  start() {
    this._status = cpz.Status.started;
    this._startedAt = dayjs.utc().toISOString();
    this._eventsToSend.push({
      type: cpz.Event.ROBOT_STARTED,
      data: {
        robotId: this._robotId
      }
    });
  }

  stop() {
    this._status = cpz.Status.stopped;
    this._stoppedAt = dayjs.utc().toISOString();
    this._error = null;
    this._eventsToSend.push({
      type: cpz.Event.ROBOT_STOPPED,
      data: {
        robotId: this._robotId
      }
    });
  }

  update(settings: { [key: string]: any }) {
    this._settings = { ...this._settings, ...settings };
    this._eventsToSend.push({
      type: cpz.Event.ROBOT_UPDATED,
      data: {
        robotId: this._robotId
      }
    });
  }

  pause() {
    this._status = cpz.Status.paused;
  }

  setError(err: any) {
    let error = err;
    if (err instanceof Errors.MoleculerError) {
      if (err.data) {
        const { critical } = err.data;
        if (critical) {
          this._status = cpz.Status.failed;
        }
      }
      error = {
        code: err.code,
        type: err.type,
        message: err.message,
        data: err.data
      };
    }
    this._eventsToSend.push({
      type: cpz.Event.ERROR,
      data: error
    });
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
    return this._hasAlerts;
  }

  get hasBaseIndicators() {
    return Object.values(this._indicators).filter(
      ({ type }) => type === cpz.IndicatorType.base
    );
  }

  get baseIndicatorsFileNames() {
    return Object.values(this._indicators)
      .filter(({ type }) => type === cpz.IndicatorType.base)
      .map(({ fileName }) => fileName);
  }

  setBaseIndicatorsCode(
    baseIndicators: { fileName: string; code: cpz.IndicatorCode }[]
  ) {
    baseIndicators.forEach(({ fileName, code }) => {
      this._baseIndicatorsCode[fileName] = code;
    });
  }

  setStrategy(
    strategyCode: cpz.StrategyCode,
    strategyStateProp: cpz.StrategyState
  ) {
    try {
      const strategyState = strategyStateProp || this._strategy;
      // Функции стратегии
      const strategyFunctions: { [key: string]: () => any } = {};
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
        robotSettings: this._settings,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        robotId: this._robotId,
        posLastNumb: strategyState.posLastNumb,
        positions: strategyState.positions,
        parametersSchema,
        strategyFunctions, // функции стратегии
        log: this._log.bind(this),
        ...strategyState // предыдущий стейт стратегии
      });
    } catch (error) {
      throw error;
    }
  }

  set indicatorsState(indicatorsState: cpz.IndicatorState) {
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
          case cpz.IndicatorType.base: {
            // Если базовый индикатор

            // Считываем объект индикатора

            const indicatorCode = this._baseIndicatorsCode[
              `${indicator.fileName}`
            ];
            // Берем все функции индикатора
            const indicatorFunctions: { [key: string]: () => any } = {};
            Object.getOwnPropertyNames(indicatorCode)
              .filter(ownProp => typeof indicatorCode[ownProp] === "function")
              .forEach(ownProp => {
                indicatorFunctions[ownProp] = indicatorCode[ownProp];
              });

            // Схема параметров
            const { parametersSchema } = indicatorCode;
            // Создаем новый инстанc базового индикатора
            this._indicatorInstances[key] = new BaseIndicator({
              exchange: this._exchange,
              asset: this._asset,
              currency: this._currency,
              timeframe: this._timeframe,
              robotSettings: this._settings,
              robotId: this._robotId,
              parametersSchema,
              indicatorFunctions, // функции индикатора
              ...indicator // стейт индикатора
            });

            break;
          }
          case cpz.IndicatorType.tulip: {
            // Если внешний индикатор Tulip

            // Создаем новый инстанc индикатора Tulip
            this._indicatorInstances[key] = new TulipIndicatorClass({
              exchange: this._exchange,
              asset: this._asset,
              currency: this._currency,
              timeframe: this._timeframe,
              robotSettings: this._settings,
              robotId: this._robotId,
              parameters: indicator.parameters,
              ...indicator // стейт индикатора
            });

            break;
          }
          /* case INDICATORS_TALIB: {
              // Если внешний индикатор Talib
  
              // Создаем новый инстанc индикатора Talib
              this._indicatorInstances[key] = new TalibIndicatorClass({
                exchange: this._exchange,
                asset: this._asset,
                currency: this._currency,
                timeframe: this._timeframe,
                robotSettings: this._settings,
                robotId: this._robotId,
                parameters: indicator.parameters,
                ...indicator // стейт индикатора
              });
  
              break;
            }
            case INDICATORS_TECH: {
              // Если внешний индикатор Tech
  
              // Создаем новый инстанc индикатора Tech
              this._indicatorInstances[key] = new TechInicatatorClass({
                exchange: this._exchange,
                asset: this._asset,
                currency: this._currency,
                timeframe: this._timeframe,
                robotSettings: this._settings,
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
      throw error;
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
      throw error;
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
        if (!this._indicatorInstances[key].initialized) {
          this._indicatorInstances[key]._checkParameters();
          this._indicatorInstances[key].init();
          this._indicatorInstances[key].initialized = true;
        }
      });
      this.getIndicatorsState();
    } catch (error) {
      throw error;
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
          this._indicatorInstances[key]._eventsToSend = [];
          this._indicatorInstances[key]._handleCandles(
            this._candle,
            this._candles,
            this._candlesProps
          );
          await this._indicatorInstances[key].calc();
        })
      );
      this.getIndicatorsState();
    } catch (error) {
      throw error;
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
      this._strategyInstance._handleCandles(
        this._candle,
        this._candles,
        this._candlesProps
      );
      this._strategyInstance._handleIndicators(this._indicators);
      // Очищаем предыдущие  задачи у позиций
      this._strategyInstance._clearAlerts();
      // Запустить проверку стратегии
      this._strategyInstance.check();
      this.getStrategyState();
    } catch (error) {
      throw error;
    }
  }

  checkAlerts() {
    try {
      // Передать свечу и значения индикаторов в инстанс стратегии
      this._strategyInstance._handleCandles(
        this._candle,
        this._candles,
        this._candlesProps
      );
      // Запустить проверку стратегии
      this._strategyInstance._checkAlerts();
      this.getStrategyState();
    } catch (error) {
      throw error;
    }
  }

  handleCachedCandles(candles: cpz.Candle[]) {
    this._candles = candles;
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

  handleCandle(candle: cpz.Candle) {
    if (candle.id === this._lastCandle.id) return;
    if (this._candles.filter(({ id }) => id === candle.id).length === 0) {
      this._candles = [...new Set([...this._candles, candle])];
    }
    this._candle = candle;
    if (!this._lastCandle.id && this._candles.length > 1)
      this._lastCandle = this._candles[this._candles.length - 2];
    this._prepareCandles();
  }

  handleCurrentCandle(candle: cpz.Candle) {
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
        this._eventsToSend = [
          ...this._eventsToSend,
          ...this._indicatorInstances[ind]._eventsToSend
        ];
        this._indicators[ind].initialized = this._indicatorInstances[
          ind
        ].initialized;
        this._indicators[ind].parameters = this._indicatorInstances[
          ind
        ].parameters;
        // Все свойства инстанса стратегии
        Object.keys(this._indicatorInstances[ind])
          .filter(key => !key.startsWith("_")) // публичные (не начинаются с "_")
          .forEach(key => {
            if (typeof this._indicatorInstances[ind][key] !== "function")
              this._indicators[ind].variables[key] = this._indicatorInstances[
                ind
              ][key]; // сохраняем каждое свойство
          });
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Запрос текущего состояния стратегии
   *
   * @memberof Adviser
   */
  getStrategyState() {
    try {
      this._eventsToSend = [
        ...this._eventsToSend,
        ...this._strategyInstance._events
      ];
      this._strategy.initialized = this._strategyInstance.initialized;
      this._strategy.positions = this._strategyInstance.validPositions;
      this._strategy.posLastNumb = this._strategyInstance.posLastNumb;
      this._hasAlerts = this._strategyInstance.hasAlerts;
      // Все свойства инстанса стратегии
      Object.keys(this._strategyInstance)
        .filter(key => !key.startsWith("_")) // публичные (не начинаются с "_")
        .forEach(key => {
          if (typeof this._strategyInstance[key] !== "function")
            this._strategy.variables[key] = this._strategyInstance[key]; // сохраняем каждое свойство
        });
    } catch (error) {
      throw error;
    }
  }

  get state() {
    return {
      robot_id: this._robotId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      strategy_name: this._strategyName,
      settings: this._settings,
      last_candle: this._lastCandle,
      has_actions: this._hasAlerts,
      status: this._status,
      started_at: this._started_at,
      stopped_at: this._stopped_at
    };
  }

  get props() {
    return {
      robot_id: this._robotId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      strategy_name: this._strategyName
    };
  }

  get strategy() {
    return this._strategy;
  }

  get indicators() {
    return this._indicators;
  }
}

export = Robot;

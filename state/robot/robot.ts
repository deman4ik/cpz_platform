import { cpz } from "../../types/cpz";
import dayjs from "../../lib/dayjs";

import { Errors } from "moleculer";
import BaseStrategy from "./robot_strategy";
import BaseIndicator from "./robot_indicator";
import TulipIndicatorClass from "../../lib/tulip/tulipIndicators";
import { combineRobotSettings } from "../settings";

class Robot {
  [key: string]: any;
  _id: string;
  _code: string;
  _name: string;
  _description: string;
  _available: number;
  _exchange: string;
  _asset: string;
  _currency: string;
  _timeframe: cpz.Timeframe;
  _strategyName: string;
  _settings: { [key: string]: any };
  _lastCandle: cpz.Candle;
  _strategy: cpz.StrategyProps;
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
  _statistics: { [key: string]: any };
  _eventsToSend: cpz.Events<any>[];
  _postionsToSave: cpz.RobotPositionState[];
  _error: any;
  _log = console.log;

  constructor(state: cpz.RobotState) {
    /* Идентификатор робота */
    this._id = state.id;

    this._code = state.code;

    this._name = state.name;
    this._description = state.description;
    this._available = state.available;
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

    /* Настройки */
    this._settings = combineRobotSettings(state.settings);
    /* Последняя свеча */
    this._lastCandle = state.lastCandle;
    /* Состояне стратегии */
    this._strategy = state.state || {
      variables: {},
      positions: [],
      posLastNumb: {},
      indicators: {},
      initialized: false
    };
    /* Действия для проверки */
    this._hasAlerts = state.hasAlerts || false;
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
    this._startedAt = state.startedAt;
    this._stoppedAt = state.stoppedAt;
    this._statistics = state.statistics || {};

    this._eventsToSend = [];
    this._postionsToSave = [];
    this._indicatorInstances = {};
  }

  get eventsToSend() {
    return this._eventsToSend;
  }

  get positionsToSave() {
    return this._postionsToSave;
  }

  get alertEventsToSend(): cpz.Events<cpz.SignalEvent>[] {
    return this._eventsToSend.filter(
      ({ type }) => type === cpz.Event.SIGNAL_ALERT
    );
  }

  get tradeEventsToSend(): cpz.Events<cpz.SignalEvent>[] {
    return this._eventsToSend.filter(
      ({ type }) => type === cpz.Event.SIGNAL_TRADE
    );
  }

  get logEventsToSend() {
    return this._eventsToSend.filter(
      ({ type }) => type === cpz.Event.ROBOT_LOG
    );
  }

  get strategyName() {
    return this._strategyName;
  }

  get exchange() {
    return this._exchange;
  }

  get asset() {
    return this._asset;
  }

  get currency() {
    return this._currency;
  }

  get timeframe() {
    return this._timeframe;
  }

  start() {
    this._status = cpz.Status.started;
    this._startedAt = dayjs.utc().toISOString();
    this._eventsToSend.push({
      type: cpz.Event.ROBOT_STARTED,
      data: {
        robotId: this._id
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
        robotId: this._id
      }
    });
  }

  update(settings: { [key: string]: any }) {
    this._settings = { ...this._settings, ...settings };
    this._eventsToSend.push({
      type: cpz.Event.ROBOT_UPDATED,
      data: {
        robotId: this._id
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

  get requiredHistoryMaxBars() {
    return this._settings.requiredHistoryMaxBars;
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
    strategyCodeParam: cpz.StrategyCode = { init() {}, check() {} },
    strategyState: cpz.StrategyProps = this._strategy
  ) {
    try {
      let strategyCode: { [key: string]: any } = {};
      if (strategyCodeParam) strategyCode = strategyCodeParam;
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
        robotId: this._id,
        posLastNumb: strategyState.posLastNumb,
        positions: strategyState.positions,
        parametersSchema,
        strategyFunctions, // функции стратегии
        ...strategyState // предыдущий стейт стратегии
      });
      this._strategyInstance._log = this._log.bind(this);
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
              robotId: this._id,
              parametersSchema,
              indicatorFunctions, // функции индикатора
              ...indicator // стейт индикатора
            });
            this._indicatorInstances[key]._log = this._log.bind(this);
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
              robotId: this._id,
              parameters: indicator.parameters,
              ...indicator // стейт индикатора
            });
            this._indicatorInstances[key]._log = this._log.bind(this);
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
                robotId: this._id,
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
                robotId: this._id,
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

  handleHistoryCandles(candles: cpz.Candle[]) {
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
    if (this._lastCandle && candle.id === this._lastCandle.id) return;
    if (this._candles.filter(({ time }) => time === candle.time).length === 0) {
      this._candles = [...this._candles, candle];
    }
    this._candles = this._candles.slice(-this._settings.requiredHistoryMaxBars);
    this._candle = candle;
    if (!this._lastCandle && this._candles.length > 1)
      this._lastCandle = this._candles[this._candles.length - 2];
    this._prepareCandles();
  }

  handleCurrentCandle(candle: cpz.Candle) {
    this._candle = candle;
  }

  clearEvents() {
    this._eventsToSend = [];
    this._postionsToSave = [];
    this._strategyInstance._eventsToSend = [];
    this._strategyInstance._positionsToSave = [];
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
        ...this._strategyInstance._eventsToSend
      ];
      this._postionsToSave = this._strategyInstance._positionsToSave;
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

  get state(): cpz.RobotState {
    return {
      id: this._id,
      code: this._code,
      name: this._name,
      description: this._description,
      available: this._available,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      strategyName: this._strategyName,
      settings: this._settings,
      lastCandle: this._lastCandle,
      hasAlerts: this._hasAlerts,
      status: this._status,
      startedAt: this._startedAt,
      stoppedAt: this._stoppedAt,
      indicators: this._indicators,
      state: this._strategy,
      statistics: this._statistics
    };
  }

  get props() {
    return {
      robotId: this._id,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
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

export = Robot;

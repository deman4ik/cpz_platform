import { INDICATORS_BASE, INDICATORS_TULIP } from "cpzState";

class BaseStrategy {
  constructor(state) {
    this._initialized = state.initialized || false; // стратегия инициализирована
    this._settings = state.settings;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._candle = null;
    this._indicators = state.indicators || {};
    this._advice = state.advice; // Генерация события NewSignal
    this._log = state.log; // Функция логирования в консоль
    this._logEvent = state.logEvent; // Функция логирования в EventGrid в топик CPZ-LOGS
    if (state.variables) {
      Object.keys(state.variables).forEach(key => {
        this[key] = state.variables[key];
      });
    }
    if (state.strategyFunctions) {
      Object.getOwnPropertyNames(state.strategyFunctions).forEach(key => {
        this[key] = state.strategyFunctions[key];
      });
    }
  }

  init() {}

  check() {}

  _handleCandle(candle, indicators) {
    this._candle = candle;
    this._indicators = indicators;
    Object.keys(this._indicators).forEach(key => {
      if (this._indicators[key].variables)
        Object.keys(this._indicators[key].variables).forEach(variable => {
          this._indicators[key][variable] = this._indicators[key].variables[
            variable
          ];
        });
    });
  }

  get handleCandle() {
    return this._handleCandle;
  }

  _addIndicator(name, indicatorName, options) {
    this._indicators[name] = {};
    this._indicators[name].name = name;
    this._indicators[name].indicatorName = indicatorName;
    this._indicators[name].fileName = indicatorName;
    this._indicators[name].type = INDICATORS_BASE;
    this._indicators[name].options = options;
    this._indicators[name].variables = {};
  }

  get addIndicator() {
    return this._addIndicator;
  }

  _addTulipIndicator(name, indicatorName, options) {
    this._addIndicator(name, indicatorName, options);
    this._indicators[name].type = INDICATORS_TULIP;
  }

  get addTulipIndicator() {
    return this._addTulipIndicator;
  }

  get initialized() {
    return this._initialized;
  }

  set initialized(value) {
    this._initialized = value;
  }

  get settings() {
    return this._settings;
  }

  get exchange() {
    return this._exchange;
  }

  get asset() {
    return this._asset;
  }

  get currency() {
    return this._сurrency;
  }

  get timeframe() {
    return this._timeframe;
  }

  get candle() {
    return this._candle;
  }

  get indicators() {
    return this._indicators;
  }

  get advice() {
    return this._advice;
  }

  get log() {
    return this._log;
  }

  get logEvent() {
    return this._logEvent;
  }
}

export default BaseStrategy;

class BaseStrategy {
  constructor(state) {
    this._context = state.context; // текущий контекст выполнения
    this._initialized = state.initialized || false; // стратегия инициализирована
    this._settings = state.settings;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._candle = null;
    this._indicators = state.indicators || {};
    this._advice = state.advice; // Генерация события NewSignal
    this._log = state.log; // Функция логирования в EventGrid в топик CPZ-LOGS
    if (state.variables) {
      Object.keys(state.variables).forEach(key => {
        this[key] = state.variables[key];
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
    this._context.log(this._indicators);
  }
  get handleCandle() {
    return this._handleCandle;
  }
  _addIndicator(name, indicatorName, options) {
    this._indicators[name] = {};
    this._indicators[name].name = name;
    this._indicators[name].indicatorName = indicatorName;
    this._indicators[name].options = options;
    this._indicators[name].variables = {};
  }
  get addIndicator() {
    return this._addIndicator;
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
}

module.exports = BaseStrategy;

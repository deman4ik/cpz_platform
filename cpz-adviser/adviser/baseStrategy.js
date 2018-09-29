class BaseStrategy {
  constructor(state) {
    this._context = state.context; // текущий контекст выполнения
    this._settings = state.settings;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._candle = null;
    this._indicators = state.indicators;
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
  _handleCandle(candle) {
    this._candle = candle;
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

  get advice() {
    return this._advice;
  }

  get log() {
    return this._log;
  }
}

module.exports = BaseStrategy;

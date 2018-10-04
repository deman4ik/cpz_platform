class BaseIndicator {
  constructor(state) {
    this._context = state.context; // текущий контекст выполнения
    this._name = state.name;
    this._indicatorName = state.indicatorName;
    this._initialized = state.initialized || false; // индикатор инициализирован
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._options = state.options;
    this._candle = null;
    this._candles = [];
    this._candlesProps = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: []
    };
    this._tulipIndicators = state.tulipIndicators || {};
    this._log = state.log; // Функция логирования в консоль
    this._logEvent = state.logEvent; // Функция логирования в EventGrid в топик CPZ-LOGS
    if (state.variables) {
      Object.keys(state.variables).forEach(key => {
        this[key] = state.variables[key];
      });
    }
    if (state.indicatorFunctions) {
      Object.getOwnPropertyNames(state.indicatorFunctions).forEach(key => {
        this[key] = state.indicatorFunctions[key];
      });
    }
  }

  init() {}

  calc() {}

  done() {
    return Promise.resolve();
  }

  _handleCandle(candle, candles, candlesProps) {
    this._candle = candle;
    this._candles = candles;
    this._candlesProps = candlesProps;
  }

  get handleCandle() {
    return this._handleCandle;
  }

  get initialized() {
    return this._initialized;
  }

  set initialized(value) {
    this._initialized = value;
  }

  get options() {
    return this._options;
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

  get candles() {
    return this._candles;
  }

  get candlesProps() {
    return this._candlesProps;
  }

  get log() {
    return this._log;
  }

  get logEvent() {
    return this._logEvent;
  }
}

export default BaseIndicator;

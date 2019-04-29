import Log from "cpz/log";
import { chunkArrayIncrEnd } from "cpz/utils/helpers";
import { createLogEvent } from "../utils/helpers";
import createTulip from "../lib/tulip/create";

class BaseIndicator {
  constructor(state) {
    this._name = state.name;
    this._indicatorName = state.indicatorName;
    this._initialized = state.initialized || false; // индикатор инициализирован
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._adviserSettings = state.adviserSettings;
    this._robotId = state.robotId;
    this._options = state.options;
    this._candle = null; // {}
    this._candles = []; // [{}]
    this._candlesProps = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: []
    };
    this._eventsToSend = {};
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

  get _events() {
    return this._eventsToSend;
  }

  get _nextEventIndex() {
    return Object.keys(this._eventsToSend).length;
  }

  done() {
    return Promise.resolve();
  }

  prepareCandles(candles) {
    const candlesProps = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: []
    };
    candles.forEach(candle => {
      candlesProps.open.push(candle.open);
      candlesProps.high.push(candle.high);
      candlesProps.low.push(candle.low);
      candlesProps.close.push(candle.close);
      candlesProps.volume.push(candle.volume);
    });
    return candlesProps;
  }

  candlesChunks(chunkSize, chunkQuantity) {
    const candlesArr = chunkArrayIncrEnd(this._candles, chunkSize);
    return candlesArr.splice(-chunkQuantity);
  }

  candlesPropsChunks(chunkSize, chunkQuantity) {
    const candlesArr = this.candlesChunks(chunkSize, chunkQuantity);
    const candlesPropsArr = candlesArr.map(candles =>
      this.prepareCandles(candles)
    );
    return candlesPropsArr;
  }

  addTulip(name, options) {
    this._tulipIndicators[name] = createTulip[name].create(options);
  }

  get tulip() {
    return this._tulipIndicators;
  }

  async calcTulip(name, options, candlesProps) {
    const calculate = createTulip[name].create(options);
    const result = await calculate(candlesProps);
    return result.result ? result.result : result;
  }

  async calcTulipSeries(
    name,
    options,
    candlesChunkSize,
    candlesChunksQuantity
  ) {
    const calculate = createTulip[name].create(options);
    const candlesPropsChunks = this.candlesPropsChunks(
      candlesChunkSize,
      candlesChunksQuantity
    );
    const results = await Promise.all(
      candlesPropsChunks.map(async candlesProps => {
        const result = await calculate(candlesProps);
        return result.result ? result.result : result;
      })
    );
    return results;
  }

  _log(...args) {
    Log.debug(`${this._robotId}`, ...args);
  }

  get log() {
    return this._log;
  }

  _logEvent(data) {
    this._eventsToSend[`${this._nextEventIndex}_ind`] = createLogEvent(
      this._robotId,
      data
    );
  }

  get logEvent() {
    return this._logEvent;
  }

  _handleCandles(candle, candles, candlesProps) {
    this._candle = candle;
    this._candles = candles;
    this._candlesProps = candlesProps;
  }

  get handleCandles() {
    return this._handleCandles;
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
    return this._currency;
  }

  get timeframe() {
    return this._timeframe;
  }

  get adviserSettings() {
    return this._adviserSettings;
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
}

export default BaseIndicator;

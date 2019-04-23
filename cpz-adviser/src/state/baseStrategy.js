import { v4 as uuid } from "uuid";
import dayjs from "cpz/utils/lib/dayjs";
import {
  INDICATORS_BASE,
  INDICATORS_TULIP,
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_SHORT,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_STOP,
  ORDER_DIRECTION_BUY,
  ORDER_DIRECTION_SELL
} from "cpz/config/state";
import { SIGNALS_NEWSIGNAL_EVENT } from "cpz/events/types/signals";
import Log from "cpz/log";
import { createLogEvent } from "../utils/helpers";

class BaseStrategy {
  constructor(state) {
    this._initialized = state.initialized || false; // стратегия инициализирована
    this._parameters = state.parameters;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._robotId = state.robotId;
    this._positions = state.positions || {};
    this._candle = null;
    this._candles = []; // [{}]
    this._candlesProps = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: []
    };
    this._indicators = state.indicators || {};
    this._consts = {
      TRADE_ACTION_LONG,
      TRADE_ACTION_CLOSE_LONG,
      TRADE_ACTION_SHORT,
      TRADE_ACTION_CLOSE_SHORT,
      ORDER_TYPE_LIMIT,
      ORDER_TYPE_MARKET,
      ORDER_TYPE_STOP,
      ORDER_DIRECTION_BUY,
      ORDER_DIRECTION_SELL
    };
    this._eventsToSend = {};
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

  get _events() {
    return this._eventsToSend;
  }

  get _nextEventIndex() {
    return Object.keys(this._eventsToSend).length;
  }

  _log(...args) {
    Log.debug(`${this._robotId}`, ...args);
  }

  get log() {
    return this._log;
  }

  _logEvent(data) {
    this._eventsToSend[`${this._nextEventIndex}_str`] = createLogEvent(
      this._robotId,
      data
    );
  }

  get logEvent() {
    return this._logEvent;
  }

  _advice(signal) {
    Log.debug(`Advice from ${this._robotId}`, signal);
    this._eventsToSend[`${this._nextEventIndex}_str`] = {
      eventType: SIGNALS_NEWSIGNAL_EVENT,
      eventData: {
        subject: this._robotId.toString(),
        data: {
          ...signal,
          signalId: uuid(),
          robotId: this._robotId,
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: this._timeframe,
          candleId: this._candle.id,
          candleTimestamp: this._candle.timestamp,
          timestamp: dayjs.utc().toISOString()
        }
      }
    };
  }

  get advice() {
    return this._advice;
  }

  _createPosition(positionState) {
    const positionId = uuid();
    const positionCode =
      positionState.code || positionState.positionCode || positionId;
    this._positions[positionCode] = {
      ...positionState,
      positionId
    };
  }

  get createPosition() {
    return this._createPosition;
  }

  _handleIndicators(indicators) {
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

  get handleIndicators() {
    return this._handleIndicators;
  }

  _handleCandles(candle, candles, candlesProps) {
    this._candle = candle;
    this._candles = candles;
    this._candlesProps = candlesProps;
  }

  get handleCandles() {
    return this._handleCandles;
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

  get parameters() {
    return this._parameters;
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

  get positions() {
    return this._positions;
  }

  get CONSTS() {
    return this._consts;
  }
}

export default BaseStrategy;

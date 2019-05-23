import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import dayjs from "cpz/utils/dayjs";
import ServiceValidator from "cpz/validator";
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
  POS_STATUS_CLOSED
} from "cpz/config/state";
import { SIGNALS_NEWSIGNAL_EVENT } from "cpz/events/types/signals";
import { sortAsc } from "cpz/utils/helpers";
import { createLogEvent } from "../utils/helpers";
import Position from "./position";

class BaseStrategy {
  constructor(state) {
    this._initialized = state.initialized || false; // стратегия инициализирована
    this._parameters = state.parameters || {};
    this._adviserSettings = state.adviserSettings;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._robotId = state.robotId;
    this._posLastNumb = state.posLastNumb || {};
    this._positions = {};
    this.positions = state.positions;
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
      LONG: TRADE_ACTION_LONG,
      CLOSE_LONG: TRADE_ACTION_CLOSE_LONG,
      SHORT: TRADE_ACTION_SHORT,
      CLOSE_SHORT: TRADE_ACTION_CLOSE_SHORT,
      LIMIT: ORDER_TYPE_LIMIT,
      MARKET: ORDER_TYPE_MARKET,
      STOP: ORDER_TYPE_STOP
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
    this._parametersSchema = state.parametersSchema;
  }

  init() {}

  check() {}

  _checkParameters() {
    if (this._parametersSchema && Object.keys(this._parametersSchema > 0)) {
      ServiceValidator.simpleCheck(this._parametersSchema, this._parameters);
    }
  }

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

  get hasActions() {
    let hasActions = false;
    Object.values(this._positions).forEach(position => {
      if (position.hasActions) {
        hasActions = true;
      }
    });
    return hasActions;
  }

  _createAdvices() {
    Object.values(this._positions).forEach(position => {
      if (position.signal) {
        this._advice(position.signal);
        position._clearSignal();
      }
    });
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

  /** POSITIONS */

  _positionsHandleCandle(candle) {
    if (Object.keys(this._positions).length > 0) {
      Object.keys(this._positions).forEach(key => {
        this._positions[key]._handleCandle(candle);
      });
    }
  }

  _getNextPositionCode(prefix = "p") {
    if (Object.prototype.hasOwnProperty.call(this._posLastNumb, prefix)) {
      this._posLastNumb[prefix] += 1;
    } else {
      this._posLastNumb[prefix] = 1;
    }
    return `${prefix}_${this._posLastNumb[prefix]}`;
  }

  _createPosition(props = {}) {
    const { prefix = "p", parentId } = props;

    const position = this._getPosition(prefix, parentId);
    if (position) return position;

    const code = this._getNextPositionCode(prefix);
    this._positions[code] = new Position({
      prefix,
      code,
      parentId
    });

    this._positions[code]._handleCandle(this._candle);
    return this._positions[code];
  }

  get createPosition() {
    return this._createPosition;
  }

  get hasActivePositions() {
    return (
      Object.values(this._positions).filter(position => position.isActive)
        .length > 0
    );
  }

  _hasActivePosition(prefix = "p") {
    return !!this._getPosition(prefix);
  }

  get hasActivePosition() {
    return this._hasActivePosition;
  }

  _getPosition(prefix = "p", parentId) {
    const positions = Object.values(this._positions)
      .filter(
        pos =>
          pos.prefix === prefix &&
          ((!parentId && pos.isActive) || pos.parentId === parentId)
      )
      .sort((a, b) => sortAsc(a.code, b.code));
    if (positions.length > 0) {
      return positions[0];
    }
    return null;
  }

  get getPosition() {
    return this._getPosition;
  }

  get positions() {
    return Object.values(this._positions).map(pos => pos.state);
  }

  set positions(positions) {
    if (positions && Array.isArray(positions) && positions.length > 0) {
      positions.forEach(position => {
        this._positions[position.code] = new Position(...position);
      });
    }
  }

  get activePositions() {
    return Object.values(this._positions)
      .filter(position => position.isActive)
      .map(pos => pos.state);
  }

  _runActions() {
    Object.keys(this._positions).forEach(key => {
      if (this._positions[key].hasActions) {
        this._positions[key]._runActions();
        if (this._positions[key].signal) {
          this._advice(this._positions[key].signal);
          this._positions[key]._clearSignal();
        }
        if (this._positions[key].status === POS_STATUS_CLOSED) {
          delete this._positions[key];
        }
      }
    });
  }

  /** INDICATORS */
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
    try {
      this._candle = candle;
      this._candles = candles;
      this._candlesProps = candlesProps;
      this._positionsHandleCandle(candle);
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.ADVISER_STRATEGY_ERROR,
          cause: error,
          info: {
            ...this.props
          }
        },
        "Failed to handle candles in strategy instance"
      );
    }
  }

  get handleCandles() {
    return this._handleCandles;
  }

  _addIndicator(name, indicatorName, parameters) {
    this._indicators[name] = {};
    this._indicators[name].name = name;
    this._indicators[name].indicatorName = indicatorName;
    this._indicators[name].fileName = indicatorName;
    this._indicators[name].type = INDICATORS_BASE;
    this._indicators[name].parameters = parameters;
    this._indicators[name].variables = {};
  }

  get addIndicator() {
    return this._addIndicator;
  }

  _addTulipIndicator(name, indicatorName, parameters) {
    this._addIndicator(name, indicatorName, parameters);
    this._indicators[name].type = INDICATORS_TULIP;
  }

  get addTulipIndicator() {
    return this._addTulipIndicator;
  }

  /*
  _addTalibIndicator(name, indicatorName, parameters) {
    this._addIndicator(name, indicatorName, parameters);
    this._indicators[name].type = INDICATORS_TALIB;
  }

  get addTalibIndicator() {
    return this._addTalibIndicator;
  }

  _addTechIndicator(name, indicatorName, parameters) {
    this._addIndicator(name, indicatorName, parameters);
    this._indicators[name].type = INDICATORS_TECH;
  }

  get addTechIndicator() {
    return this._addTechIndicator;
  }
*/

  /** GETTERS  */
  get initialized() {
    return this._initialized;
  }

  set initialized(value) {
    this._initialized = value;
  }

  get parameters() {
    return this._parameters;
  }

  get adviserSettings() {
    return this._adviserSettings;
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

  get CONSTS() {
    return this._consts;
  }
}

export default BaseStrategy;

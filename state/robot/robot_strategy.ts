import { cpz } from "../../types/cpz";
import { ValidationSchema } from "fastest-validator";
import dayjs from "../../lib/dayjs";
import { v4 as uuid } from "uuid";
import { validate, sortAsc } from "../../utils";
import Position from "./robot_position";

// TODO: объявить тип для класса

class BaseStrategy extends cpz.Strategy {
  _initialized: boolean;
  _parameters: { [key: string]: number | string };
  _adviserSettings: { [key: string]: number | string };
  _exchange: string;
  _asset: string;
  _currency: string;
  _timeframe: cpz.Timeframe;
  _robotId: string;
  _posLastNumb: { [key: string]: number };
  _positions: { [key: string]: cpz.RobotPosition };
  _parametersSchema: ValidationSchema;
  _candle: cpz.Candle;
  _candles: cpz.Candle[];
  _candlesProps: cpz.CandleProps;
  _indicators: {
    [key: string]: {
      [key: string]: any;
      name: string;
      indicatorName: string;
      fileName: string;
      type: string;
      parameters: { [key: string]: any };
      variables: { [key: string]: any };
    };
  };
  _consts: { [key: string]: string };
  _eventsToSend: { [key: string]: cpz.Events };
  _log: (...args: any) => void;

  constructor(state: any) {
    super();
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
    this._setPositions(state.positions);
    this._parametersSchema = state.parametersSchema;
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
      LONG: cpz.TradeAction.long,
      CLOSE_LONG: cpz.TradeAction.closeLong,
      SHORT: cpz.TradeAction.short,
      CLOSE_SHORT: cpz.TradeAction.closeShort,
      LIMIT: cpz.OrderType.limit,
      MARKET: cpz.OrderType.market,
      STOP: cpz.OrderType.stop
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
    this._log = state.log;
  }

  init() {}

  check() {}

  _checkParameters() {
    if (
      this._parametersSchema &&
      Object.keys(this._parametersSchema).length > 0
    ) {
      validate(this._parameters, this._parametersSchema);
    }
  }

  get _events() {
    return this._eventsToSend;
  }

  get _nextEventIndex() {
    return Object.keys(this._eventsToSend).length;
  }

  get log() {
    return this._log;
  }

  _logEvent(data: any) {
    this._eventsToSend[`${this._nextEventIndex}_str`] = {
      type: cpz.Event.LOG,
      data: {
        ...data,
        robotId: this._robotId
      }
    };
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
      if (position.tradeSignal) {
        this._advice(position.tradeSignal);
        position._clearTradeSignal();
      }
    });
  }

  _advice(tradeSignal: cpz.SignalInfo) {
    const data: cpz.SignalEvent = {
      ...tradeSignal,
      signalId: uuid(),
      robotId: this._robotId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      candleId: this._candle.id,
      candleTimestamp: this._candle.timestamp,
      timestamp: dayjs.utc().toISOString()
    };
    this.log("Trade Signal", data);
    this._eventsToSend[`${this._nextEventIndex}_str`] = {
      type: cpz.Event.TRADE_SIGNAL_NEW,
      data
    };
  }

  get advice() {
    return this._advice;
  }

  /** POSITIONS */

  _positionsHandleCandle(candle: cpz.Candle) {
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

  _createPosition(props: { prefix?: string; parentId?: string } = {}) {
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

  _getPosition(prefix: string = "p", parentId?: string) {
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

  _setPositions(positions: any) {
    if (positions && Array.isArray(positions) && positions.length > 0) {
      positions.forEach(position => {
        this._positions[position.code] = new Position(position);
      });
    }
  }

  get validPositions() {
    return Object.values(this._positions)
      .filter(position => position.status !== cpz.RobotPositionStatus.closed)
      .map(pos => pos.state);
  }

  _runActions() {
    Object.keys(this._positions).forEach(key => {
      if (this._positions[key].hasActions) {
        this._positions[key]._runActions();
        if (this._positions[key].tradeSignal) {
          this._advice(this._positions[key].tradeSignal);
          this._positions[key]._clearTradeSignal();
        }
        if (this._positions[key].status === cpz.RobotPositionStatus.closed) {
          delete this._positions[key];
        }
      }
    });
  }

  _clearActions() {
    Object.keys(this._positions).forEach(key => {
      if (this._positions[key].hasActions) {
        this._positions[key]._clearActions();
      }
    });
  }

  /** INDICATORS */
  _handleIndicators(indicators: {
    [key: string]: {
      name: string;
      indicatorName: string;
      fileName: string;
      type: string;
      parameters: { [key: string]: any };
      variables: { [key: string]: any };
    };
  }) {
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

  _handleCandles(
    candle: cpz.Candle,
    candles: cpz.Candle[],
    candlesProps: cpz.CandleProps
  ) {
    try {
      this._candle = candle;
      this._candles = candles;
      this._candlesProps = candlesProps;
      this._positionsHandleCandle(candle);
    } catch (error) {
      throw error;
    }
  }

  get handleCandles() {
    return this._handleCandles;
  }

  _addIndicator(
    name: string,
    indicatorName: string,
    parameters: { [key: string]: any }
  ) {
    this._indicators[name] = {
      name,
      indicatorName,
      fileName: indicatorName,
      type: cpz.IndicatorType.base,
      parameters: parameters,
      variables: {}
    };
  }

  get addIndicator() {
    return this._addIndicator;
  }

  _addTulipIndicator(
    name: string,
    indicatorName: string,
    parameters: { [key: string]: any }
  ) {
    this._addIndicator(name, indicatorName, parameters);
    this._indicators[name].type = cpz.IndicatorType.tulip;
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

  get posLastNumb() {
    return this._posLastNumb;
  }
}

export = BaseStrategy;

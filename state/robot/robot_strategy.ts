import { cpz } from "../../types/cpz";
import { ValidationSchema } from "fastest-validator";
import dayjs from "../../lib/dayjs";
import { v4 as uuid } from "uuid";
import { validate, sortAsc } from "../../utils";
import Position from "./robot_position";

// TODO: объявить тип для класса

class BaseStrategy implements cpz.Strategy {
  [key: string]: any;
  _initialized: boolean;
  _parameters: { [key: string]: number | string };
  _robotSettings: { [key: string]: number | string };
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
    [key: string]: cpz.IndicatorState;
  };
  _consts: { [key: string]: string };
  _eventsToSend: cpz.Events[];
  _positionsToSave: cpz.RobotPositionState[];
  _log: (...args: any) => void;

  constructor(state: cpz.StrategyState) {
    this._initialized = state.initialized || false; // стратегия инициализирована
    this._parameters = state.parameters || {};
    this._robotSettings = state.robotSettings;
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
    this._eventsToSend = [];
    this._positionsToSave = [];
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
    this._log = state.log || console.log;
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

  get log() {
    return this._log;
  }

  _logEvent(data: any) {
    this._eventsToSend.push({
      type: cpz.Event.LOG,
      data: data
    });
  }

  get logEvent() {
    return this._logEvent;
  }

  get hasAlerts() {
    let hasAlerts = false;
    Object.values(this._positions).forEach(position => {
      if (position.hasAlerts) {
        hasAlerts = true;
      }
    });
    return hasAlerts;
  }

  _createAlertEvents() {
    Object.values(this._positions).forEach(position => {
      if (position.hasAlertsToPublish) {
        position.alertsToPublish.forEach(signal =>
          this._createSignalEvent(signal)
        );
        position._clearAlertsToPublish();
      }
    });
  }

  _createAlertEvent(signal: cpz.SignalInfo) {
    this._eventsToSend.push({
      type: cpz.Event.SIGNAL_ALERT,
      data: signal
    });
  }

  _createTradeEvents() {
    Object.values(this._positions).forEach(position => {
      if (position.hasTradeToPublish) {
        this._createSignalEvent(position.tradeToPublish);
        position._clearTradeToPublish();
        this._positionsToSave.push(position.state);
      }
    });
  }

  _createTadeEvent(signal: cpz.SignalInfo) {
    this._eventsToSend.push({
      type: cpz.Event.SIGNAL_TRADE,
      data: signal
    });
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
      id: uuid(),
      robot_id: this._robotId,
      prefix,
      code,
      parent_id: parentId,
      log: this._log.bind(this)
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

  _checkAlerts() {
    Object.keys(this._positions).forEach(key => {
      if (this._positions[key].hasAlerts) {
        this._positions[key]._checkAlerts();
        if (this._positions[key].hasTradeToPublish) {
          this._createTadeEvent(this._positions[key].tradeToPublish);
          this._positions[key]._clearTradeToPublish();
          if (this._positions[key].status === cpz.RobotPositionStatus.closed) {
            delete this._positions[key];
          }
        }
      }
    });
  }

  _clearAlerts() {
    Object.keys(this._positions).forEach(key => {
      if (this._positions[key].hasAlerts) {
        this._positions[key]._clearAlerts();
      }
    });
  }

  /** INDICATORS */
  _handleIndicators(indicators: { [key: string]: cpz.IndicatorState }) {
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
  
    _addTechIndicator(name, indicatorName, parameters) {
      this._addIndicator(name, indicatorName, parameters);
      this._indicators[name].type = INDICATORS_TECH;
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

  get robotSettings() {
    return this._robotSettings;
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

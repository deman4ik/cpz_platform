import { cpz } from "../../@types";
import { ValidationSchema } from "fastest-validator";
import dayjs from "../../lib/dayjs";
import { v4 as uuid } from "uuid";
import { validate, sortAsc } from "../../utils";
import Position from "./robotPosition";

class BaseStrategy implements cpz.Strategy {
  [key: string]: any;
  _initialized: boolean;
  _parameters: { [key: string]: number | string };
  _robotSettings: cpz.RobotSettings;
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
  _eventsToSend: cpz.Events<any>[];
  _positionsToSave: cpz.RobotPositionState[];
  _log = console.log;
  _dayjs = dayjs;

  constructor(state: cpz.StrategyState) {
    this._log = state.log || console.log;
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
      Object.keys(state.variables).forEach((key) => {
        this[key] = state.variables[key];
      });
    }
    if (state.strategyFunctions) {
      Object.getOwnPropertyNames(state.strategyFunctions).forEach((key) => {
        this[key] = state.strategyFunctions[key];
      });
    }
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
      type: cpz.Event.ROBOT_LOG,
      data: {
        ...data,
        candle: this._candle,
        robotId: this._robotId
      }
    });
  }

  get logEvent() {
    return this._logEvent;
  }

  get hasAlerts() {
    let hasAlerts = false;
    Object.values(this._positions).forEach((position) => {
      if (position.hasAlerts) {
        hasAlerts = true;
      }
    });
    return hasAlerts;
  }

  get dayjs() {
    return dayjs;
  }

  _createAlertEvents() {
    Object.values(this._positions).forEach((position) => {
      if (position.hasAlertsToPublish) {
        position.alertsToPublish.forEach((signal) =>
          this._createSignalEvent(signal, cpz.Event.SIGNAL_ALERT)
        );
        position._clearAlertsToPublish();
        this._positionsToSave.push(position.state);
      }
    });
  }

  _createTradeEvents() {
    Object.values(this._positions).forEach((position) => {
      if (position.hasTradeToPublish) {
        this._createSignalEvent(
          position.tradeToPublish,
          cpz.Event.SIGNAL_TRADE
        );
        position._clearTradeToPublish();
        this._positionsToSave.push(position.state);
      }
    });
  }

  _createSignalEvent(signal: cpz.SignalInfo, type: cpz.Event) {
    const signalData: cpz.SignalEvent = {
      ...signal,
      id: uuid(),
      robotId: this._robotId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      timestamp: dayjs.utc().toISOString()
    };

    this._eventsToSend.push({
      type: type,
      data: signalData
    });
  }
  /** POSITIONS */

  _positionsHandleCandle(candle: cpz.Candle) {
    if (Object.keys(this._positions).length > 0) {
      Object.keys(this._positions).forEach((key) => {
        if (
          this._positions[key].isActive &&
          (this._positions[key].highestHigh === null ||
            this._positions[key].lowestLow === null)
        ) {
          this._positions[key]._initHighLow(
            this._candlesProps.high,
            this._candlesProps.low
          );
        }
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
      robotId: this._robotId,
      timeframe: this._timeframe,
      volume: this._robotSettings.volume,
      prefix,
      code,
      parentId: parentId
    });
    this._positions[code]._log = this._log.bind(this);
    this._positions[code]._handleCandle(this._candle);
    return this._positions[code];
  }

  get createPosition() {
    return this._createPosition;
  }

  get hasActivePositions() {
    return (
      Object.values(this._positions).filter((position) => position.isActive)
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
        (pos) =>
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
    return Object.values(this._positions).map((pos) => pos.state);
  }

  _setPositions(positions: any) {
    if (positions && Array.isArray(positions) && positions.length > 0) {
      positions.forEach((position) => {
        this._positions[position.code] = new Position(position);
        this._positions[position.code]._log = this._log.bind(this);
      });
    }
  }

  get validPositions() {
    return Object.values(this._positions)
      .filter((position) => position.status !== cpz.RobotPositionStatus.closed)
      .map((pos) => pos.state);
  }

  _checkAlerts() {
    Object.keys(this._positions)
      .sort((a, b) =>
        sortAsc(
          this._positions[a].code.split("_")[1],
          this._positions[b].code.split("_")[1]
        )
      )
      .forEach((key) => {
        if (this._positions[key].hasAlerts) {
          this._positions[key]._checkAlerts();
          if (this._positions[key].hasTradeToPublish) {
            this._createSignalEvent(
              this._positions[key].tradeToPublish,
              cpz.Event.SIGNAL_TRADE
            );
            this._positionsToSave.push(this._positions[key].state);
            this._positions[key]._clearTradeToPublish();
            if (
              this._positions[key].status === cpz.RobotPositionStatus.closed
            ) {
              delete this._positions[key];
            }
          }
        }
      });
  }

  _clearAlerts() {
    Object.keys(this._positions).forEach((key) => {
      if (this._positions[key].hasAlerts) {
        this._positions[key]._clearAlerts();
      }
    });
  }

  /** INDICATORS */
  _handleIndicators(indicators: { [key: string]: cpz.IndicatorState }) {
    this._indicators = indicators;
    Object.keys(this._indicators).forEach((key) => {
      if (this._indicators[key].variables)
        Object.keys(this._indicators[key].variables).forEach((variable) => {
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

  get candles() {
    return this._candles;
  }

  get candlesProps() {
    return this._candlesProps;
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

import { sortAsc } from "../../utils";
import { cpz } from "../../types/cpz";
import dayjs from "../../lib/dayjs";

/**
 * Robot position
 *
 * @class Position
 */
class Position implements cpz.RobotPosition {
  private _id: string;
  private _robotId: string;
  private _timeframe: number;
  private _prefix: string;
  private _code: string;
  private _parentId?: string;
  private _direction?: cpz.PositionDirection;
  private _status: cpz.RobotPositionStatus;
  private _entryStatus?: cpz.RobotTradeStatus;
  private _entryPrice?: number;
  private _entryDate?: string;
  private _entryOrderType?: cpz.OrderType;
  private _entryAction?: cpz.TradeAction;
  private _entryCandleTimestamp?: string;
  private _exitStatus?: cpz.RobotTradeStatus;
  private _exitPrice?: number;
  private _exitDate?: string;
  private _exitOrderType?: cpz.OrderType;
  private _exitAction?: cpz.TradeAction;
  private _exitCandleTimestamp?: string;
  private _alerts?: { [key: string]: cpz.AlertInfo };
  private _profit: number;
  private _barsHeld: number;
  private _candle?: cpz.Candle;
  private _alertsToPublish: cpz.SignalInfo[];
  private _tradeToPublish: cpz.SignalInfo;
  _log = console.log;

  constructor(state: cpz.RobotPositionState) {
    this._id = state.id;
    this._robotId = state.robotId;
    this._timeframe = state.timeframe;
    this._prefix = state.prefix;
    this._code = state.code;
    this._parentId = state.parentId;
    this._direction = state.direction;
    this._status = state.status || cpz.RobotPositionStatus.new;
    this._entryStatus = state.entryStatus;
    this._entryPrice = state.entryPrice;
    this._entryDate = state.entryDate;
    this._entryOrderType = state.entryOrderType;
    this._entryAction = state.entryAction;
    this._entryCandleTimestamp = state.entryCandleTimestamp;
    this._exitStatus = state.exitStatus;
    this._exitPrice = state.exitPrice;
    this._exitDate = state.exitDate;
    this._exitOrderType = state.exitOrderType;
    this._exitAction = state.exitAction;
    this._exitCandleTimestamp = state.exitCandleTimestamp;
    this._alerts = state.alerts || {};
    this._profit = state.profit || 0;
    this._barsHeld = state.barsHeld || 0;
    this._alertsToPublish = [];
    this._tradeToPublish = null;
    this._candle = null;
  }

  public get id() {
    return this._id;
  }

  public get prefix() {
    return this._prefix;
  }

  public get code() {
    return this._code;
  }

  public get parentId() {
    return this._parentId;
  }

  public get direction() {
    return this._direction;
  }

  public get entryStatus() {
    return this._entryStatus;
  }

  public get exitStatus() {
    return this._exitStatus;
  }

  public get status() {
    return this._status;
  }

  public get isActive() {
    return this._status === cpz.RobotPositionStatus.open;
  }

  public get hasAlerts() {
    return Object.keys(this._alerts).length > 0;
  }

  public get hasAlertsToPublish() {
    return this._alertsToPublish.length > 0;
  }

  public get hasTradeToPublish() {
    return !!this._tradeToPublish;
  }

  public get alertsToPublish() {
    return this._alertsToPublish;
  }

  public get tradeToPublish() {
    return this._tradeToPublish;
  }

  public get state() {
    return {
      id: this._id,
      robotId: this._robotId,
      timeframe: this._timeframe,
      prefix: this._prefix,
      code: this._code,
      parentId: this._parentId,
      direction: this._direction,
      status: this._status,
      entryStatus: this._entryStatus,
      entryPrice: this._entryPrice,
      entryDate: this._entryDate,
      entryOrderType: this._entryOrderType,
      entryAction: this._entryAction,
      entryCandleTimestamp: this._entryCandleTimestamp,
      exitStatus: this._exitStatus,
      exitPrice: this._exitPrice,
      exitDate: this._exitDate,
      exitOrderType: this._exitOrderType,
      exitAction: this._exitAction,
      exitCandleTimestamp: this._exitCandleTimestamp,
      alerts: this._alerts,
      profit: this._profit,
      barsHeld: this._barsHeld
    };
  }

  _clearAlertsToPublish() {
    this._alertsToPublish = [];
  }

  _clearTradeToPublish() {
    this._tradeToPublish = null;
  }

  /**
   * Clear alerts
   *
   * @memberof Position
   */
  _clearAlerts() {
    this._alerts = {};
  }

  _calcStats() {
    if (this._direction === cpz.PositionDirection.long) {
      this._profit = this._exitPrice - this._entryPrice;
    } else {
      this._profit = this._entryPrice - this._exitPrice;
    }
    this._barsHeld = Math.floor(
      dayjs
        .utc(this._exitCandleTimestamp)
        .diff(dayjs.utc(this._entryCandleTimestamp), cpz.TimeUnit.minute) /
        this._timeframe
    );
  }

  _handleCandle(candle: cpz.Candle) {
    this._candle = candle;
  }

  _checkOpen() {
    if (this._entryStatus === cpz.RobotTradeStatus.closed) {
      throw new Error(`Position ${this._code} is already open`);
    }
  }

  _checkClose() {
    if (this._entryStatus !== cpz.RobotTradeStatus.closed) {
      throw new Error(`Position ${this._code} is not open`);
    }
    if (this._exitStatus === cpz.RobotTradeStatus.closed) {
      throw new Error(`Position ${this._code} is already closed`);
    }
  }

  _addAlert(action: cpz.TradeAction, price: number, orderType: cpz.OrderType) {
    this._log(
      `Position alert ${this._code} - ${action} - ${orderType} - ${price}`
    );
    const alert = {
      action,
      price,
      orderType
    };
    this._alerts[this._nextAlertNumb] = alert;
    this._alertsToPublish.push({
      ...alert,
      type: cpz.SignalType.alert,
      positionId: this._id,
      positionPrefix: this._prefix,
      positionCode: this._code,
      positionParentId: this._parentId
    });
  }

  _createTradeSignal(
    action: cpz.TradeAction,
    price: number,
    orderType: cpz.OrderType
  ) {
    this._log(
      `Position trade ${this._code} - ${action}.${orderType}.${price} - ${
        this._candle.timestamp
      }`
    );
    this._alertsToPublish = [];
    this._tradeToPublish = {
      type: cpz.SignalType.trade,
      action,
      orderType,
      price,
      positionId: this._id,
      positionPrefix: this._prefix,
      positionCode: this._code,
      positionParentId: this._parentId
    };
  }

  _open(action: cpz.TradeAction, price: number, orderType: cpz.OrderType) {
    this._checkOpen();
    this._status = cpz.RobotPositionStatus.open;
    this._entryStatus = cpz.RobotTradeStatus.closed;
    this._entryPrice = price;
    this._entryDate = dayjs.utc().toISOString();
    this._entryOrderType = orderType;
    this._entryAction = action;
    this._entryCandleTimestamp = this._candle.timestamp;
    this._direction =
      action === cpz.TradeAction.long || action === cpz.TradeAction.short
        ? cpz.PositionDirection.long
        : cpz.PositionDirection.short;
    this._createTradeSignal(action, price, orderType);
  }

  _close(price: number, orderType: cpz.OrderType) {
    this._checkClose();
    this._status = cpz.RobotPositionStatus.closed;
    const action =
      this._direction === cpz.PositionDirection.long
        ? cpz.TradeAction.closeLong
        : cpz.TradeAction.closeShort;
    this._exitStatus = cpz.RobotTradeStatus.closed;
    this._exitPrice = price;
    this._exitDate = dayjs.utc().toISOString();
    this._exitOrderType = orderType;
    this._exitAction = action;
    this._exitCandleTimestamp = this._candle.timestamp;
    this._calcStats();
    this._createTradeSignal(action, price, orderType);
  }

  get _nextAlertNumb() {
    return Object.keys(this._alerts).length + 1;
  }

  _checkAlerts() {
    for (const key of Object.keys(this._alerts).sort((a, b) =>
      sortAsc(+a, +b)
    )) {
      const alert = this._alerts[key];
      const success = this._checkAlert(
        alert.action,
        alert.price,
        alert.orderType
      );
      if (success) {
        this._alerts = {};
        break;
      }
    }
  }

  _checkAlert(
    action: cpz.TradeAction,
    price: number,
    orderType: cpz.OrderType
  ) {
    let nextPrice = null;
    switch (orderType) {
      case cpz.OrderType.stop: {
        nextPrice = this._checkStop(action, price);
        break;
      }
      case cpz.OrderType.limit: {
        nextPrice = this._checkLimit(action, price);
        break;
      }
      case cpz.OrderType.market: {
        nextPrice = this._checkMarket(action, price);
        break;
      }
      default:
        throw new Error(`Unknown order type ${orderType}`);
    }
    if (nextPrice) {
      if (action === cpz.TradeAction.long || action === cpz.TradeAction.short) {
        this._open(action, nextPrice, orderType);
        return true;
      }
      this._close(nextPrice, orderType);
      return true;
    }
    return false;
  }

  _checkMarket(action: cpz.TradeAction, price: number) {
    if (
      action === cpz.TradeAction.long ||
      action === cpz.TradeAction.closeShort
    ) {
      return Math.max(this._candle.open, price);
    }
    if (
      action === cpz.TradeAction.short ||
      action === cpz.TradeAction.closeLong
    ) {
      return Math.min(this._candle.open, price);
    }
    throw new Error(`Unknown action ${action}`);
  }

  _checkStop(action: cpz.TradeAction, price: number) {
    if (
      action === cpz.TradeAction.long ||
      action === cpz.TradeAction.closeShort
    ) {
      if (this._candle.high >= price) return Math.max(this._candle.open, price);
    } else if (
      action === cpz.TradeAction.short ||
      action === cpz.TradeAction.closeLong
    ) {
      if (this._candle.low <= price) return Math.min(this._candle.open, price);
    } else {
      throw new Error(`Unknown action ${action}`);
    }
    return null;
  }

  _checkLimit(action: cpz.TradeAction, price: number): number {
    if (
      action === cpz.TradeAction.long ||
      action === cpz.TradeAction.closeShort
    ) {
      if (this._candle.high <= price) return Math.min(this._candle.open, price);
    } else if (
      action === cpz.TradeAction.short ||
      action === cpz.TradeAction.closeLong
    ) {
      if (this._candle.low >= price) return Math.max(this._candle.open, price);
    } else {
      throw new Error(`Unknown action ${action}`);
    }
    return null;
  }

  public buyAtMarket(price = this._candle.close) {
    this._checkOpen();
    this._addAlert(cpz.TradeAction.long, price, cpz.OrderType.market);
  }

  public sellAtMarket(price = this._candle.close) {
    this._checkClose();
    this._addAlert(cpz.TradeAction.closeLong, price, cpz.OrderType.market);
  }

  public shortAtMarket(price = this._candle.close) {
    this._checkOpen();
    this._addAlert(cpz.TradeAction.short, price, cpz.OrderType.market);
  }

  public coverAtMarket(price = this._candle.close) {
    this._checkClose();
    this._addAlert(cpz.TradeAction.closeShort, price, cpz.OrderType.market);
  }

  public buyAtStop(price = this._candle.close) {
    this._checkOpen();
    this._addAlert(cpz.TradeAction.long, price, cpz.OrderType.stop);
  }

  public sellAtStop(price = this._candle.close) {
    this._checkClose();
    this._addAlert(cpz.TradeAction.closeLong, price, cpz.OrderType.stop);
  }

  public shortAtStop(price = this._candle.close) {
    this._checkOpen();
    this._addAlert(cpz.TradeAction.short, price, cpz.OrderType.stop);
  }

  public coverAtStop(price = this._candle.close) {
    this._checkClose();
    this._addAlert(cpz.TradeAction.closeShort, price, cpz.OrderType.stop);
  }

  public buyAtLimit(price = this._candle.close) {
    this._checkOpen();
    this._addAlert(cpz.TradeAction.long, price, cpz.OrderType.limit);
  }

  public sellAtLimit(price = this._candle.close) {
    this._checkClose();
    this._addAlert(cpz.TradeAction.closeLong, price, cpz.OrderType.limit);
  }

  public shortAtLimit(price = this._candle.close) {
    this._checkOpen();
    this._addAlert(cpz.TradeAction.short, price, cpz.OrderType.limit);
  }

  public coverAtLimit(price = this._candle.close) {
    this._checkClose();
    this._addAlert(cpz.TradeAction.closeShort, price, cpz.OrderType.limit);
  }
}

export = Position;

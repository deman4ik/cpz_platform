import { Errors } from "moleculer";
import { cpz, GenericObject } from "../../@types";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";

class UserPosition extends cpz.UserPosition {
  _id: string;
  _prefix: string;
  _code: string;
  _positionId: string;
  _userRobotId: string;
  _status: cpz.UserPositionStatus;
  _parentId?: string;
  _direction: cpz.PositionDirection;
  _entryStatus?: cpz.OrderStatus;
  _entryPrice?: number;
  _entryDate?: string;
  _entryVolume?: number;
  _entryOrderIds?: string[];
  _exitStatus?: cpz.OrderStatus;
  _exitPrice?: number;
  _exitDate?: string;
  _exitVolume?: number;
  _exitOrderIds?: string[];
  _reason?: string; //TODO ENUM
  _profit?: number;
  _barsHeld?: number;
  _internalState: cpz.UserPositionInternalState;

  _robot: {
    exchange: string;
    asset: string;
    currency: string;
    timeframe: cpz.Timeframe;
    tradeSettings: cpz.RobotTradeSettings;
  };
  _userRobot: {
    userExAccId: string;
    settings: cpz.UserRobotSettings;
  };
  _connectorJobs: cpz.ConnectorJob[];
  _ordersToSave: cpz.Order[];

  constructor(state: cpz.UserPositionState) {
    super(state);
    this._id = state.id;
    this._prefix = state.prefix;
    this._code = state.code;
    this._positionId = state.positionId;
    this._userRobotId = state.userRobotId;
    this._status = state.status;
    this._parentId = state.parentId;
    this._direction = state.direction;
    this._entryStatus = state.entryStatus;
    this._entryPrice = state.entryPrice;
    this._entryDate = state.entryDate;
    this._entryVolume = state.entryVolume;
    this._entryOrderIds = state.entryOrderIds || [];
    this._exitStatus = state.exitStatus;
    this._exitPrice = state.exitPrice;
    this._exitDate = state.exitDate;
    this._exitVolume = state.exitVolume;
    this._exitOrderIds = state.exitOrderIds || [];
    this._internalState = state.internalState;
    this._reason = state.reason;
    this._profit = state.profit;
    this._barsHeld = state.barsHeld;
    this._robot = state.robot;
    this._userRobot = state.userRobot;

    this._connectorJobs = [];
    this._ordersToSave = [];
  }

  get id() {
    return this._id;
  }

  get positionId() {
    return this._positionId;
  }

  get status() {
    return this._status;
  }

  get parentId() {
    return this._parentId;
  }

  get state() {
    return {
      id: this._id,
      prefix: this._prefix,
      code: this._code,
      positionId: this._positionId,
      userRobotId: this._userRobotId,
      status: this._status,
      parentId: this._parentId,
      direction: this._direction,
      entryStatus: this._entryStatus,
      entryPrice: this._entryPrice,
      entryDate: this._entryDate,
      entryVolume: this._entryVolume,
      entryOrderIds: this._entryOrderIds,
      exitStatus: this._exitStatus,
      exitPrice: this._exitPrice,
      exitDate: this._exitDate,
      exitVolume: this._exitVolume,
      exitOrderIds: this._exitOrderIds,
      internalState: this._internalState,
      reason: this._reason,
      profit: this._profit,
      barsHeld: this._barsHeld
    };
  }

  get connectorJobs() {
    return this._connectorJobs;
  }

  get ordersToSave() {
    return this._ordersToSave;
  }

  _isActionEntry(action: cpz.TradeAction) {
    return action === cpz.TradeAction.long || action === cpz.TradeAction.short;
  }

  _isActionExit(action: cpz.TradeAction) {
    return (
      action === cpz.TradeAction.closeLong ||
      action === cpz.TradeAction.closeShort
    );
  }

  _isActionLong(action: cpz.TradeAction) {
    return (
      action === cpz.TradeAction.long || action === cpz.TradeAction.closeLong
    );
  }

  _isActionShort(action: cpz.TradeAction) {
    return (
      action === cpz.TradeAction.short || action === cpz.TradeAction.closeShort
    );
  }

  _createOrder(trade: cpz.TradeInfo) {
    const params: GenericObject<any> = {};
    if (this._robot.exchange === "kraken") {
      if (
        this._userRobot.settings.kraken &&
        this._userRobot.settings.kraken.leverage
      ) {
        params.kraken = {
          leverage: this._userRobot.settings.kraken.leverage
        };
      }
    }
    const order: cpz.Order = {
      id: uuid(),
      userExAccId: this._userRobot.userExAccId,
      userRobotId: this._userRobotId,
      positionId: this._positionId,
      userPositionId: this._id,
      exchange: this._robot.exchange,
      asset: this._robot.asset,
      currency: this._robot.currency,
      action: trade.action,
      direction: this._isActionLong(trade.action)
        ? cpz.OrderDirection.buy
        : cpz.OrderDirection.sell,
      type: trade.orderType,
      signalPrice: trade.price,
      price: trade.price,
      volume: this._isActionExit(trade.action)
        ? this._entryVolume
        : this._userRobot.settings.volume,
      params,
      createdAt: dayjs.utc().toISOString(),
      status: cpz.OrderStatus.new
    };

    return order;
  }

  handleSignal(signal: cpz.SignalEvent) {
    if (this._isActionEntry(signal.action)) {
      if (this._entryStatus)
        throw new Errors.MoleculerError(
          "Position already open",
          409,
          "ERR_CONFLICT",
          { userPositionId: this._id }
        );
    }

    if (this._isActionExit(signal.action)) {
      if (this._exitStatus)
        throw new Errors.MoleculerError(
          "Position already closed",
          409,
          "ERR_CONFLICT",
          { userPositionId: this._id }
        );
      //TODO: Check entry
      //TODO: Cancel position if entry open
      //TODO:
    }
    const order = this._createOrder(signal);

    this._ordersToSave.push(order);
    this._connectorJobs.push({
      id: uuid(),
      userExAccId: this._userRobot.userExAccId,
      type: cpz.ConnectorJobType.create,
      orderId: order.id
    });

    if (this._isActionEntry(order.action)) {
      this._entryStatus = order.status;
      this._entryOrderIds.push(order.id);
    }
    if (this._isActionExit(order.action)) {
      this._exitStatus = order.status;
      this._exitOrderIds.push(order.id);
    }
  }
}

export = UserPosition;

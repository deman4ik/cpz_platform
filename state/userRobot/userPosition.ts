import { Errors } from "moleculer";
import { cpz, GenericObject } from "../../@types";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";
import { addPercent, sum, average, round, sortAsc } from "../../utils";
import { ORDER_OPEN_TIMEOUT } from "../../config/settings";
import Timeframe from "../../utils/timeframe";

class UserPosition implements cpz.UserPosition {
  _log = console.log;
  _id: string;
  _prefix: string;
  _code: string;
  _positionCode: string;
  _positionId: string;
  _userRobotId: string;
  _userId: string;
  _exchange: string;
  _asset: string;
  _currency: string;
  _status: cpz.UserPositionStatus;
  _parentId?: string;
  _direction: cpz.PositionDirection;
  _entryAction?: cpz.TradeAction;
  _entryStatus?: cpz.UserPositionOrderStatus;
  _entrySignalPrice?: number;
  _entryPrice?: number;
  _entryDate?: string;
  _entryCandleTimestamp?: string;
  _entryVolume?: number;
  _entryExecuted?: number;
  _entryRemaining?: number;
  _exitAction?: cpz.TradeAction;
  _exitStatus?: cpz.UserPositionOrderStatus;
  _exitSignalPrice?: number;
  _exitPrice?: number;
  _exitDate?: string;
  _exitCandleTimestamp?: string;
  _exitVolume?: number;
  _exitExecuted?: number;
  _exitRemaining?: number;
  _reason?: string; //TODO ENUM
  _profit?: number;
  _barsHeld?: number;
  _internalState: cpz.UserPositionInternalState;
  _entryOrders?: cpz.Order[];
  _exitOrders?: cpz.Order[];
  _nextJobAt?: string;
  _nextJob?: cpz.UserPositionJob;

  _robot: {
    timeframe: cpz.Timeframe;
    tradeSettings: cpz.RobotTradeSettings;
  };
  _userRobot: {
    userExAccId: string;
    settings: cpz.UserRobotSettings;
  };

  _ordersToCreate: cpz.Order[];
  _connectorJobs: cpz.ConnectorJob[];
  _hasRecentTrade: boolean;

  constructor(state: cpz.UserPositionState) {
    this._id = state.id;
    this._prefix = state.prefix;
    this._code = state.code;
    this._positionCode = state.positionCode;
    this._positionId = state.positionId;
    this._userRobotId = state.userRobotId;
    this._userId = state.userId;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._status = state.status;
    this._parentId = state.parentId || null;
    this._direction = state.direction;
    this._entryAction = state.entryAction;
    this._entryStatus = state.entryStatus;
    this._entrySignalPrice = state.entrySignalPrice;
    this._entryPrice = state.entryPrice;
    this._entryDate = state.entryDate;
    this._entryCandleTimestamp = state.entryCandleTimestamp;
    this._entryVolume = state.entryVolume;
    this._entryExecuted = state.entryExecuted;
    this._entryRemaining = state.entryRemaining;
    this._exitAction = state.exitAction;
    this._exitStatus = state.exitStatus;
    this._exitSignalPrice = state.exitSignalPrice;
    this._exitPrice = state.exitPrice;
    this._exitDate = state.exitDate;
    this._exitCandleTimestamp = state.exitCandleTimestamp;
    this._exitVolume = state.exitVolume;
    this._exitExecuted = state.exitExecuted;
    this._exitRemaining = state.exitRemaining;
    this._internalState = state.internalState || {
      entrySlippageCount: 0,
      exitSlippageCount: 0
    };
    this._reason = state.reason;
    this._profit = state.profit;
    this._barsHeld = state.barsHeld;
    this._robot = state.robot;
    this._userRobot = state.userRobot;
    this._nextJobAt = state.nextJobAt;
    this._nextJob = state.nextJob;
    this._entryOrders = state.entryOrders || [];
    this._exitOrders = state.exitOrders || [];
    this._ordersToCreate = [];
    this._connectorJobs = [];
    this._hasRecentTrade = false;
    this._updateEntry();
    this._updateExit();
    this._setStatus();
  }

  get id() {
    return this._id;
  }

  get prefix() {
    return this._prefix;
  }

  get positionNumber() {
    return +this._positionCode.split(`${this._prefix}_`)[1];
  }

  get code() {
    return this._code;
  }

  get positionId() {
    return this._positionId;
  }

  get direction() {
    return this._direction;
  }

  get status() {
    return this._status;
  }

  get parentId() {
    return this._parentId;
  }

  get isActive() {
    return (
      this._status !== cpz.UserPositionStatus.closed &&
      this._status !== cpz.UserPositionStatus.closedAuto &&
      this._status !== cpz.UserPositionStatus.canceled
    );
  }

  get entryStatus() {
    return this._entryStatus;
  }

  get exitStatus() {
    return this._exitStatus;
  }

  get hasRecentTrade() {
    return this._hasRecentTrade;
  }

  cancel() {
    this._nextJob = cpz.UserPositionJob.cancel;
    this._nextJobAt = dayjs.utc().toISOString();
  }

  _setStatus() {
    if (
      this._entryStatus === cpz.UserPositionOrderStatus.new ||
      this._entryStatus === cpz.UserPositionOrderStatus.open
    )
      this._status = cpz.UserPositionStatus.new;
    else if (this._entryStatus === cpz.UserPositionOrderStatus.canceled) {
      this._status = cpz.UserPositionStatus.canceled;
      this._nextJob = null;
      this._nextJobAt = null;
    } else if (this._entryStatus === cpz.UserPositionOrderStatus.partial) {
      this._status = cpz.UserPositionStatus.open;
    } else if (
      this._entryStatus === cpz.UserPositionOrderStatus.closed &&
      !this._exitStatus
    ) {
      this._status = cpz.UserPositionStatus.open;
      if (this._nextJob === cpz.UserPositionJob.open) {
        this._nextJob = null;
        this._nextJobAt = null;
      }
    } else if (
      this._exitStatus === cpz.UserPositionOrderStatus.new ||
      this._exitStatus === cpz.UserPositionOrderStatus.open ||
      this._exitStatus === cpz.UserPositionOrderStatus.partial ||
      this._exitStatus === cpz.UserPositionOrderStatus.canceled
    ) {
      this._status = cpz.UserPositionStatus.open;
    } else if (this._exitStatus === cpz.UserPositionOrderStatus.closed) {
      if (this._nextJob === cpz.UserPositionJob.cancel)
        this._status = cpz.UserPositionStatus.closedAuto;
      else this._status = cpz.UserPositionStatus.closed;

      this._nextJob = null;
      this._nextJobAt = null;
      this._calcStats();
    }
  }

  _updateEntry() {
    if (
      this._entryStatus !== cpz.UserPositionOrderStatus.closed &&
      this._entryStatus !== cpz.UserPositionOrderStatus.canceled &&
      this._entryOrders &&
      this._entryOrders.length > 0
    ) {
      const order = this._entryOrders.sort((a, b) =>
        sortAsc(a.createdAt, b.createdAt)
      )[this._entryOrders.length - 1];
      if (order && order.exLastTradeAt) {
        this._entryDate = dayjs.utc(order.exLastTradeAt).toISOString();
      } else if (order && order.exTimestamp) {
        this._entryDate = dayjs.utc(order.exTimestamp).toISOString();
      }

      if (this._entryDate) {
        this._entryCandleTimestamp = Timeframe.validTimeframeDatePrev(
          this._entryDate,
          this._robot.timeframe
        );
      }

      this._entryPrice =
        round(
          average(
            ...this._entryOrders
              .filter((o) => o.status === cpz.OrderStatus.closed)
              .map((o) => +o.price || 0)
              .filter((p) => p > 0)
          ),
          6
        ) || null;
      this._entryExecuted =
        round(
          sum(
            ...this._entryOrders
              .filter((o) => o.status === cpz.OrderStatus.closed)
              .map((o) => +o.executed || 0)
          ),
          6
        ) || 0;
      this._entryRemaining = this._entryVolume - this._entryExecuted;

      if (this._entryRemaining < 0)
        throw new Errors.MoleculerError(
          "Wrong entry remaining value",
          409,
          "ERR_CONFLICT",
          { userPositionId: this._id }
        );

      if (!this._entryExecuted) {
        this._entryStatus = cpz.UserPositionOrderStatus.new;
      } else if (this._entryExecuted && this._entryExecuted === 0) {
        this._entryStatus = cpz.UserPositionOrderStatus.open;
      } else if (
        this._entryExecuted > 0 &&
        this._entryExecuted !== this._entryVolume
      ) {
        this._entryStatus = cpz.UserPositionOrderStatus.partial;
      } else if (this._entryExecuted === this._entryVolume) {
        this._hasRecentTrade = true;

        this._entryStatus = cpz.UserPositionOrderStatus.closed;
      }
    }
  }

  _updateExit() {
    if (
      this._exitStatus !== cpz.UserPositionOrderStatus.closed &&
      this._exitStatus !== cpz.UserPositionOrderStatus.canceled &&
      this._exitOrders &&
      this._exitOrders.length > 0
    ) {
      const order = this._exitOrders.sort((a, b) =>
        sortAsc(a.createdAt, b.createdAt)
      )[this._exitOrders.length - 1];
      if (order && order.exLastTradeAt) {
        this._exitDate = dayjs.utc(order.exLastTradeAt).toISOString();
      } else if (order && order.exTimestamp) {
        this._exitDate = dayjs.utc(order.exTimestamp).toISOString();
      }
      if (this._exitDate) {
        this._exitCandleTimestamp = Timeframe.validTimeframeDatePrev(
          this._exitDate,
          this._robot.timeframe
        );
      }

      this._exitPrice =
        round(
          average(
            ...this._exitOrders
              .filter((o) => o.status === cpz.OrderStatus.closed)
              .map((o) => +o.price || 0)
              .filter((p) => p > 0)
          ),
          6
        ) || null;
      this._exitExecuted =
        round(
          sum(
            ...this._exitOrders
              .filter((o) => o.status === cpz.OrderStatus.closed)
              .map((o) => +o.executed || 0)
          ),
          6
        ) || 0;
      this._exitRemaining = this._exitVolume - this._exitExecuted;

      if (this._exitRemaining < 0)
        throw new Errors.MoleculerError(
          "Wrong exit remaining value",
          409,
          "ERR_CONFLICT",
          { userPositionId: this._id }
        );
      if (!this._exitExecuted) {
        this._exitStatus = cpz.UserPositionOrderStatus.new;
      } else if (this._exitExecuted && this._exitExecuted === 0) {
        this._exitStatus = cpz.UserPositionOrderStatus.open;
      } else if (
        this._exitExecuted > 0 &&
        this._exitExecuted !== this._exitVolume
      ) {
        this._exitStatus = cpz.UserPositionOrderStatus.partial;
      } else if (this._exitExecuted === this._exitVolume) {
        this._hasRecentTrade = true;
        this._exitStatus = cpz.UserPositionOrderStatus.closed;
      }
    }
  }

  _calcStats() {
    const entryBalance = +round(
      sum(
        ...this._entryOrders
          .filter((o) => o.status === cpz.OrderStatus.closed)
          .map((o) => +o.price * +o.executed - (o.fee && +o.fee) || 0)
      ),
      6
    );
    const exitBalance = +round(
      sum(
        ...this._exitOrders
          .filter((o) => o.status === cpz.OrderStatus.closed)
          .map((o) => +o.price * +o.executed - (o.fee && +o.fee) || 0)
      ),
      6
    );
    if (this._direction === cpz.PositionDirection.long) {
      this._profit = +round(exitBalance - entryBalance, 6);
    } else {
      this._profit = +round(entryBalance - exitBalance, 6);
    }

    if (!this._barsHeld)
      this._barsHeld = +round(
        dayjs
          .utc(this._exitCandleTimestamp)
          .diff(dayjs.utc(this._entryCandleTimestamp), cpz.TimeUnit.minute) /
          this._robot.timeframe
      );
  }

  get tradeEvent(): cpz.UserTradeEventData {
    return {
      id: this._id,
      code: this._code,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      userRobotId: this._userRobotId,
      userId: this._userId,
      status: this._status,
      entryAction: this._entryAction,
      entryStatus: this._entryStatus,
      entryPrice: this._entryPrice,
      entryDate: this._entryDate,
      entryCandleTimestamp: this._entryCandleTimestamp,
      entryExecuted: this._entryExecuted,
      exitAction: this._exitAction,
      exitStatus: this._exitStatus,
      exitPrice: this._exitPrice,
      exitDate: this._exitDate,
      exitCandleTimestamp: this._exitCandleTimestamp,
      exitExecuted: this._exitExecuted,
      reason: this._reason,
      profit: this._profit,
      barsHeld: this._barsHeld
    };
  }

  get state(): cpz.UserPositionDB {
    return {
      id: this._id,
      prefix: this._prefix,
      code: this._code,
      positionCode: this._positionCode,
      positionId: this._positionId,
      userRobotId: this._userRobotId,
      userId: this._userId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      status: this._status,
      parentId: this._parentId,
      direction: this._direction,
      entryAction: this._entryAction,
      entryStatus: this._entryStatus,
      entrySignalPrice: this._entrySignalPrice,
      entryPrice: this._entryPrice,
      entryDate: this._entryDate,
      entryCandleTimestamp: this._entryCandleTimestamp,
      entryVolume: this._entryVolume,
      entryExecuted: this._entryExecuted,
      entryRemaining: this._entryRemaining,
      exitAction: this._exitAction,
      exitStatus: this._exitStatus,
      exitSignalPrice: this._exitSignalPrice,
      exitPrice: this._exitPrice,
      exitDate: this._exitDate,
      exitCandleTimestamp: this._exitCandleTimestamp,
      exitVolume: this._exitVolume,
      exitExecuted: this._exitExecuted,
      exitRemaining: this._exitRemaining,
      internalState: this._internalState,
      reason: this._reason,
      profit: this._profit,
      barsHeld: this._barsHeld,
      nextJobAt: this._nextJobAt,
      nextJob: this._nextJob
    };
  }

  get ordersToCreate() {
    return this._ordersToCreate;
  }

  get connectorJobs() {
    return this._connectorJobs;
  }

  get hasOpenEntryOrders() {
    return (
      this._entryOrders &&
      Array.isArray(this._entryOrders) &&
      this._entryOrders.filter(
        (o) =>
          o.status === cpz.OrderStatus.new || o.status === cpz.OrderStatus.open
      ).length > 0
    );
  }

  get hasOpenExitOrders() {
    return (
      this._exitOrders &&
      Array.isArray(this._exitOrders) &&
      this._exitOrders.filter(
        (o) =>
          o.status === cpz.OrderStatus.new || o.status === cpz.OrderStatus.open
      ).length > 0
    );
  }

  get lastEntryOrder() {
    return (
      this._entryOrders &&
      Array.isArray(this._entryOrders) &&
      this._entryOrders.length > 0 &&
      this._entryOrders[this._entryOrders.length - 1]
    );
  }

  get lastExitOrder() {
    return (
      this._exitOrders &&
      Array.isArray(this._exitOrders) &&
      this._exitOrders.length > 0 &&
      this._exitOrders[this._exitOrders.length - 1]
    );
  }

  get hasEntrySlippage() {
    return (
      this._robot.tradeSettings.slippage &&
      this._robot.tradeSettings.slippage.entry
    );
  }

  get hasExitSlippage() {
    return (
      this._robot.tradeSettings.slippage &&
      this._robot.tradeSettings.slippage.exit
    );
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

  _isActionBuy(action: cpz.TradeAction) {
    return (
      action === cpz.TradeAction.long || action === cpz.TradeAction.closeShort
    );
  }

  _isActionSell(action: cpz.TradeAction) {
    return (
      action === cpz.TradeAction.short || action === cpz.TradeAction.closeLong
    );
  }

  _setPrice(trade: cpz.TradeInfo) {
    if (!trade.price) return trade.price;
    let price: number = trade.price;
    let slippage: number;
    if (this._isActionEntry(trade.action)) {
      if (
        this._robot.tradeSettings.slippage &&
        this._robot.tradeSettings.slippage.entry &&
        this._robot.tradeSettings.slippage.entry.stepPercent > 0
      ) {
        this._internalState.entrySlippageCount += 1;
        slippage =
          this._robot.tradeSettings.slippage.entry.stepPercent *
          this._internalState.entrySlippageCount;
      }
    } else {
      if (
        this._robot.tradeSettings.slippage &&
        this._robot.tradeSettings.slippage.exit &&
        this._robot.tradeSettings.slippage.exit.stepPercent > 0
      ) {
        this._internalState.exitSlippageCount += 1;
        slippage =
          this._robot.tradeSettings.slippage.exit.stepPercent *
          this._internalState.exitSlippageCount;
      }
    }

    if (slippage && slippage > 0) {
      if (this._isActionBuy(trade.action)) price = addPercent(price, slippage);
      else price = addPercent(price, -slippage);
    }

    if (
      this._isActionEntry(trade.action) &&
      this._robot.tradeSettings.deviation &&
      this._robot.tradeSettings.deviation.entry &&
      this._robot.tradeSettings.deviation.entry > 0
    ) {
      if (this._isActionBuy(trade.action))
        price += this._robot.tradeSettings.deviation.entry;
      else price -= this._robot.tradeSettings.deviation.entry;
    } else if (
      this._isActionExit(trade.action) &&
      this._robot.tradeSettings.deviation &&
      this._robot.tradeSettings.deviation.exit &&
      this._robot.tradeSettings.deviation.exit > 0
    ) {
      if (this._isActionBuy(trade.action))
        price += this._robot.tradeSettings.deviation.exit;
      else price -= this._robot.tradeSettings.deviation.exit;
    }
    return price;
  }

  _createOrder(trade: cpz.TradeInfo) {
    const order: cpz.Order = {
      id: uuid(),
      userExAccId: this._userRobot.userExAccId,
      userRobotId: this._userRobotId,
      positionId: this._positionId,
      userPositionId: this._id,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      action: trade.action,
      direction: this._isActionBuy(trade.action)
        ? cpz.OrderDirection.buy
        : cpz.OrderDirection.sell,
      type: trade.orderType,
      signalPrice: trade.price,
      price: this._setPrice(trade),
      volume: this._isActionExit(trade.action)
        ? this._exitRemaining || this._entryExecuted
        : this._userRobot.settings.volume,
      executed: 0,
      params: {
        orderTimeout:
          this._robot.tradeSettings.orderTimeout || ORDER_OPEN_TIMEOUT
      },
      createdAt: dayjs.utc().toISOString(),
      status: cpz.OrderStatus.new,
      nextJob: {
        type: cpz.OrderJobType.create
      }
    };
    if (order.volume < 0)
      throw new Errors.MoleculerError(
        "Wrong order volume value",
        409,
        "ERR_CONFLICT",
        { userPositionId: this._id }
      );

    order.remaining = order.volume;

    if (this._exchange === "kraken") {
      if (
        this._userRobot.settings.kraken &&
        this._userRobot.settings.kraken.leverage
      ) {
        order.params.kraken = {
          leverage: this._userRobot.settings.kraken.leverage
        };
      }
    }

    return order;
  }

  _open(trade: cpz.TradeInfo) {
    const order = this._createOrder(trade);
    this._ordersToCreate.push(order);
    this._connectorJobs.push({
      id: uuid(),
      type: cpz.OrderJobType.create,
      priority: cpz.Priority.high,
      userExAccId: this._userRobot.userExAccId,
      orderId: order.id,
      nextJobAt: dayjs.utc().toISOString()
    });
    this._entryOrders.push(order);
    this._entryVolume = this._userRobot.settings.volume;
    this._entryAction = trade.action;
    this._updateEntry();
    this._setStatus();
  }

  _close(trade: cpz.TradeInfo) {
    const order = this._createOrder(trade);
    this._ordersToCreate.push(order);
    this._connectorJobs.push({
      id: uuid(),
      type: cpz.OrderJobType.create,
      priority: cpz.Priority.high,
      userExAccId: this._userRobot.userExAccId,
      orderId: order.id,
      nextJobAt: dayjs.utc().toISOString()
    });
    this._exitOrders.push(order);
    if (!this._exitVolume || this._exitVolume === 0)
      this._exitVolume = this._entryExecuted;
    this._exitAction = trade.action;
    this._updateExit();
    this._setStatus();
  }

  handleSignal(signal: cpz.SignalEvent) {
    if (this._isActionEntry(signal.action)) {
      if (this._entryStatus || this._nextJob === cpz.UserPositionJob.open)
        throw new Errors.MoleculerError(
          "Position already open",
          409,
          "ERR_CONFLICT",
          { userPositionId: this._id }
        );

      this._entrySignalPrice = signal.price;
      this._nextJob = cpz.UserPositionJob.open;
      this._nextJobAt = dayjs.utc().toISOString();
      this._open(signal);
    } else if (this._isActionExit(signal.action)) {
      if (this._exitStatus || this._nextJob === cpz.UserPositionJob.close)
        return;

      this._barsHeld = signal.positionBarsHeld;
      if (this._entryStatus !== cpz.UserPositionOrderStatus.closed) {
        this.cancel();
        return;
      }

      if (this._nextJob === cpz.UserPositionJob.cancel) return;

      this._exitSignalPrice = signal.price;
      this._nextJob = cpz.UserPositionJob.close;
      this._nextJobAt = dayjs.utc().toISOString();
      this._close(signal);
    }
  }

  handleDelayedSignal() {
    this.handleSignal(this._internalState.delayedSignal);
  }

  /*handleOrder(order: cpz.Order) {
    if (this._isActionEntry(order.action)) {
      this._entryDate =
        order.exLastTradeAt || order.exTimestamp || dayjs.utc().toISOString();
      this._entryCandleTimestamp = Timeframe.validTimeframeDatePrev(
        this._entryDate,
        this._robot.timeframe
      );
      this._updateEntry();
    } else {
      this._exitDate =
        order.exLastTradeAt || order.exTimestamp || dayjs.utc().toISOString();
      this._exitCandleTimestamp = Timeframe.validTimeframeDatePrev(
        this._exitDate,
        this._robot.timeframe
      );
      this._updateExit();
    }

    this._setStatus();
  }*/

  _tryToOpen() {
    if (
      this._entryStatus === cpz.UserPositionOrderStatus.closed ||
      (this._entryExecuted && this._entryExecuted === this._entryVolume) ||
      this.hasOpenEntryOrders
    )
      return;

    const lastOrder = this.lastEntryOrder;
    if (!lastOrder) return;
    if (
      this.hasEntrySlippage &&
      this._internalState.entrySlippageCount <
        this._robot.tradeSettings.slippage.entry.count
    ) {
      if (lastOrder.status === cpz.OrderStatus.canceled) {
        this._connectorJobs.push({
          id: uuid(),
          type: cpz.OrderJobType.recreate,
          priority: cpz.Priority.medium,
          userExAccId: this._userRobot.userExAccId,
          orderId: lastOrder.id,
          nextJobAt: dayjs.utc().toISOString(),
          data: {
            price: this._setPrice({
              action: lastOrder.action,
              orderType: lastOrder.type,
              price: lastOrder.signalPrice
            })
          }
        });
      } else if (lastOrder.status === cpz.OrderStatus.closed) {
        this._open({
          action: lastOrder.action,
          orderType: lastOrder.type,
          price: this._entrySignalPrice
        });
      }
    } else {
      if (this._entryExecuted && this._entryExecuted > 0) {
        this._entryStatus = cpz.UserPositionOrderStatus.closed;
        this._setStatus();
      } else {
        this._reason = "Entry slippage exceeded";
        this._entryStatus = cpz.UserPositionOrderStatus.canceled;
        this._setStatus();
      }
    }
  }

  _tryToClose() {
    if (
      this._exitStatus === cpz.UserPositionOrderStatus.closed ||
      (this._exitExecuted && this._exitExecuted === this._exitVolume) ||
      this.hasOpenExitOrders
    )
      return;
    const lastOrder = this.lastExitOrder;
    if (!lastOrder) return;

    if (
      this.hasExitSlippage &&
      this._internalState.exitSlippageCount <
        this._robot.tradeSettings.slippage.exit.count
    ) {
      if (lastOrder.status === cpz.OrderStatus.canceled) {
        this._connectorJobs.push({
          id: uuid(),
          type: cpz.OrderJobType.recreate,
          priority: cpz.Priority.medium,
          userExAccId: this._userRobot.userExAccId,
          orderId: lastOrder.id,
          nextJobAt: dayjs.utc().toISOString(),
          data: {
            price: this._setPrice({
              action: lastOrder.action,
              orderType: lastOrder.type,
              price: lastOrder.signalPrice
            })
          }
        });
      } else if (lastOrder.status === cpz.OrderStatus.closed) {
        this._close({
          action: lastOrder.action,
          orderType: lastOrder.type,
          price: this._exitSignalPrice
        });
      }
    } else {
      this._tryToCancel();
    }
  }

  _tryToCancel() {
    // Position entry not closed
    if (
      this._entryStatus &&
      this._entryStatus !== cpz.UserPositionOrderStatus.closed
    ) {
      // Entry not execute
      if (
        this._entryStatus === cpz.UserPositionOrderStatus.new ||
        this._entryStatus === cpz.UserPositionOrderStatus.open
      ) {
        const orders =
          this._entryOrders &&
          Array.isArray(this._entryOrders) &&
          this._entryOrders.filter(
            (o) =>
              (o.status === cpz.OrderStatus.new ||
                o.status === cpz.OrderStatus.open) &&
              (!o.nextJob ||
                (o.nextJob && o.nextJob.type !== cpz.OrderJobType.cancel)) &&
              o.type !== cpz.OrderType.forceMarket
          );
        // Entry has open orders
        if (orders && orders.length > 0) {
          // Cancel all open orders
          orders.forEach((o) => {
            this._connectorJobs.push({
              id: uuid(),
              type: cpz.OrderJobType.cancel,
              priority: cpz.Priority.high,
              userExAccId: this._userRobot.userExAccId,
              orderId: o.id,
              nextJobAt: dayjs.utc().toISOString()
            });
          });
        } else if (!this.hasOpenEntryOrders) {
          this._entryStatus = cpz.UserPositionOrderStatus.canceled;
          this._status = cpz.UserPositionStatus.canceled;
        }
      } else if (this._entryStatus === cpz.UserPositionOrderStatus.partial) {
        // Entry already executed
        // Getting entry signal orders
        const orders =
          this._entryOrders &&
          Array.isArray(this._entryOrders) &&
          this._entryOrders.filter(
            (o) =>
              (o.status === cpz.OrderStatus.new ||
                o.status === cpz.OrderStatus.open) &&
              (!o.nextJob ||
                (o.nextJob && o.nextJob.type !== cpz.OrderJobType.cancel)) &&
              o.type !== cpz.OrderType.forceMarket
          );
        // Entry has open signal orders
        if (orders && orders.length > 0) {
          // Cancel all entry signal orders
          orders.forEach((o) => {
            this._connectorJobs.push({
              id: uuid(),
              type: cpz.OrderJobType.cancel,
              priority: cpz.Priority.high,
              userExAccId: this._userRobot.userExAccId,
              orderId: o.id,
              nextJobAt: dayjs.utc().toISOString()
            });
          });
        }
        // Entry hasn't any open signal orders
        if (!this.hasOpenEntryOrders) {
          // Creating new exit order to close position
          this._close({
            action:
              this._direction === cpz.PositionDirection.long
                ? cpz.TradeAction.closeLong
                : cpz.TradeAction.closeShort,
            orderType: cpz.OrderType.forceMarket
          });
        }
      }
    } else if (
      this._entryStatus === cpz.UserPositionOrderStatus.closed &&
      !this._exitStatus
    ) {
      // Position is open, but there is no exit signal
      // Creating new exit order to close position
      this._close({
        action:
          this._direction === cpz.PositionDirection.long
            ? cpz.TradeAction.closeLong
            : cpz.TradeAction.closeShort,
        orderType: cpz.OrderType.forceMarket
      });
    } else if (
      this._exitStatus &&
      this._exitStatus !== cpz.UserPositionOrderStatus.closed
    ) {
      // Position is open, and there was an exit signal
      // Getting exit open signal orders
      const orders =
        this._exitOrders &&
        Array.isArray(this._exitOrders) &&
        this._exitOrders.filter(
          (o) =>
            (o.status === cpz.OrderStatus.new ||
              o.status === cpz.OrderStatus.open) &&
            (!o.nextJob ||
              (o.nextJob && o.nextJob.type !== cpz.OrderJobType.cancel)) &&
            o.type !== cpz.OrderType.forceMarket
        );
      // Exit has open signal orders
      if (orders && orders.length > 0) {
        // Cancel all exit signal orders
        orders.forEach((o) => {
          this._connectorJobs.push({
            id: uuid(),
            type: cpz.OrderJobType.cancel,
            priority: cpz.Priority.high,
            userExAccId: this._userRobot.userExAccId,
            orderId: o.id,
            nextJobAt: dayjs.utc().toISOString()
          });
        });
      }

      // Exit hasn't any open signal orders
      if (!this.hasOpenExitOrders) {
        // Creating new exit order to close position
        this._close({
          action:
            this._direction === cpz.PositionDirection.long
              ? cpz.TradeAction.closeLong
              : cpz.TradeAction.closeShort,
          orderType: cpz.OrderType.forceMarket
        });
      }
    } else if (
      !this._entryStatus &&
      !this._exitStatus &&
      !this.hasOpenEntryOrders &&
      !this.hasOpenExitOrders
    ) {
      this._status = cpz.UserPositionStatus.canceled;
    }
  }

  executeJob() {
    if (this._nextJob === cpz.UserPositionJob.open) {
      this._tryToOpen();
    } else if (this._nextJob === cpz.UserPositionJob.close) {
      this._tryToClose();
    } else if (this._nextJob === cpz.UserPositionJob.cancel) {
      this._tryToCancel();
    }
  }
}

export = UserPosition;

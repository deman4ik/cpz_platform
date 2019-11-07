import { Errors } from "moleculer";
import { cpz, GenericObject } from "../../@types";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";
import { addPercent, averageRound, average, round } from "../../utils";

class UserPosition implements cpz.UserPosition {
  _log = console.log;
  _id: string;
  _prefix: string;
  _code: string;
  _positionId: string;
  _userRobotId: string;
  _status: cpz.UserPositionStatus;
  _parentId?: string;
  _direction: cpz.PositionDirection;
  _entryStatus?: cpz.UserPositionOrderStatus;
  _entrySignalPrice?: number;
  _entryPrice?: number;
  _entryDate?: string;
  _entryVolume?: number;
  _entryExecuted?: number;
  _entryRemaining?: number;
  _entryOrderIds?: string[];
  _exitStatus?: cpz.UserPositionOrderStatus;
  _exitSignalPrice?: number;
  _exitPrice?: number;
  _exitDate?: string;
  _exitVolume?: number;
  _exitExecuted?: number;
  _exitRemaining?: number;
  _exitOrderIds?: string[];
  _reason?: string; //TODO ENUM
  _profit?: number;
  _barsHeld?: number;
  _internalState: cpz.UserPositionInternalState;
  _entryOrders?: cpz.Order[];
  _exitOrders?: cpz.Order[];
  _nextJobAt?: string;
  _nextJob?: cpz.UserPositionJob;

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

  _ordersToCreate: cpz.Order[];
  _orderWithJobs: cpz.OrderWithJob[];

  constructor(state: cpz.UserPositionState) {
    this._id = state.id;
    this._prefix = state.prefix;
    this._code = state.code;
    this._positionId = state.positionId;
    this._userRobotId = state.userRobotId;
    this._status = state.status;
    this._parentId = state.parentId;
    this._direction = state.direction;
    this._entryStatus = state.entryStatus;
    this._entrySignalPrice = state.entrySignalPrice;
    this._entryPrice = state.entryPrice;
    this._entryDate = state.entryDate;
    this._entryVolume = state.entryVolume;
    this._entryExecuted = state.entryExecuted;
    this._entryRemaining = state.entryRemaining;
    this._entryOrderIds = state.entryOrderIds || [];
    this._exitStatus = state.exitStatus;
    this._exitSignalPrice = state.exitSignalPrice;
    this._exitPrice = state.exitPrice;
    this._exitDate = state.exitDate;
    this._exitVolume = state.exitVolume;
    this._exitExecuted = state.exitExecuted;
    this._exitRemaining = state.exitRemaining;
    this._exitOrderIds = state.exitOrderIds || [];
    this._internalState = state.internalState;
    this._reason = state.reason;
    this._profit = state.profit;
    this._barsHeld = state.barsHeld;
    this._robot = state.robot;
    this._userRobot = state.userRobot;
    this._nextJobAt = state.nextJobAt;
    this._nextJob = state.nextJob;
    this._entryOrders = state.entryOrders;
    this._exitOrders = state.exitOrders;
    this._ordersToCreate = [];
    this._orderWithJobs = [];
  }

  get id() {
    return this._id;
  }

  get prefix() {
    return this._prefix;
  }

  get code() {
    return this._code;
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
      this._status === cpz.UserPositionStatus.canceled;
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
    }
  }

  _updateEntry() {
    if (this._entryOrders && this._entryOrders.length > 0) {
      this._entryPrice = round(
        average(...this._entryOrders.map(o => +o.price || 0)),
        6
      );
      this._entryExecuted = round(
        average(...this._entryOrders.map(o => +o.executed || 0)),
        6
      );
      this._entryRemaining = round(
        average(...this._entryOrders.map(o => +o.remaining || 0)),
        6
      );
    }
    if (this._entryStatus !== cpz.UserPositionOrderStatus.canceled) {
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
        this._entryStatus = cpz.UserPositionOrderStatus.closed;
      }
    }
  }

  _updateExit() {
    if (this._exitOrders && this._exitOrders.length > 0) {
      this._exitPrice = round(
        average(...this._exitOrders.map(o => +o.price || 0)),
        6
      );
      this._exitExecuted = round(
        average(...this._exitOrders.map(o => +o.executed || 0)),
        6
      );
      this._exitRemaining = round(
        average(...this._exitOrders.map(o => +o.remaining || 0)),
        6
      );
    }
    if (this._exitStatus !== cpz.UserPositionOrderStatus.canceled) {
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
        this._exitStatus = cpz.UserPositionOrderStatus.closed;
      }
    }
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
      entrySignalPrice: this._entrySignalPrice,
      entryPrice: this._entryPrice,
      entryDate: this._entryDate,
      entryVolume: this._entryVolume,
      entryExecuted: this._entryExecuted,
      entryRemaining: this._entryRemaining,
      entryOrderIds: this._entryOrderIds,
      exitStatus: this._exitStatus,
      exitSignalPrice: this._exitSignalPrice,
      exitPrice: this._exitPrice,
      exitDate: this._exitDate,
      exitVolume: this._exitVolume,
      exitExecuted: this._exitExecuted,
      exitRemaining: this._exitRemaining,
      exitOrderIds: this._exitOrderIds,
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

  get orderWithJobs() {
    return this._orderWithJobs;
  }

  get hasOpenEntryOrders() {
    return (
      this._entryOrders &&
      this._entryOrders.filter(
        o =>
          o.status === cpz.OrderStatus.new || o.status === cpz.OrderStatus.open
      ).length > 0
    );
  }

  get hasOpenExitOrders() {
    return (
      this._exitOrders &&
      this._exitOrders.filter(
        o =>
          o.status === cpz.OrderStatus.new || o.status === cpz.OrderStatus.open
      ).length > 0
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
      price -= this._robot.tradeSettings.deviation.entry;
    } else if (
      this._isActionExit(trade.action) &&
      this._robot.tradeSettings.deviation &&
      this._robot.tradeSettings.deviation.exit &&
      this._robot.tradeSettings.deviation.exit > 0
    ) {
      if (this._isActionBuy(trade.action))
        price += this._robot.tradeSettings.deviation.exit;
      price -= this._robot.tradeSettings.deviation.exit;
    }

    return price;
  }

  _createOrder(trade: cpz.TradeInfo) {
    const params: GenericObject<any> = {};
    params.orderTimeout = this._robot.tradeSettings.orderTimeout;
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
      direction: this._isActionBuy(trade.action)
        ? cpz.OrderDirection.buy
        : cpz.OrderDirection.sell,
      type: trade.orderType,
      signalPrice: trade.price,
      price: this._setPrice(trade),
      volume: this._isActionExit(trade.action)
        ? this._exitRemaining || this._entryExecuted
        : this._userRobot.settings.volume,
      params,
      createdAt: dayjs.utc().toISOString(),
      status: cpz.OrderStatus.new,
      nextJobAt: dayjs.utc().toISOString(),
      nextJob: { type: cpz.OrderJobType.create }
    };

    return order;
  }

  _cancelPosition() {
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
          this._entryOrders.filter(
            o =>
              (o.status === cpz.OrderStatus.new ||
                o.status === cpz.OrderStatus.open) &&
              o.nextJob.type !== cpz.OrderJobType.cancel &&
              o.type !== cpz.OrderType.forceMarket
          );
        // Entry has open orders
        if (orders && orders.length > 0) {
          // Cancel all open orders
          orders.forEach(o => {
            this._orderWithJobs.push({
              id: o.id,
              nextJob: {
                type: cpz.OrderJobType.cancel
              },
              nextJobAt: dayjs.utc().toISOString()
            });
          });
        }
      } else if (this._entryStatus === cpz.UserPositionOrderStatus.partial) {
        // Entry already executed
        // Getting entry signal orders
        const orders =
          this._entryOrders &&
          this._entryOrders.filter(
            o =>
              (o.status === cpz.OrderStatus.new ||
                o.status === cpz.OrderStatus.open) &&
              o.nextJob.type !== cpz.OrderJobType.cancel &&
              o.type !== cpz.OrderType.forceMarket
          );
        // Entry has open signal orders
        if (orders && orders.length > 0) {
          // Cancel all entry signal orders
          orders.forEach(o => {
            this._orderWithJobs.push({
              id: o.id,
              nextJob: {
                type: cpz.OrderJobType.cancel
              },
              nextJobAt: dayjs.utc().toISOString()
            });
          });
        }
        // Entry hasn't any open signal orders
        if (!this.hasOpenEntryOrders) {
          // Creating new exit order to close position
          const order = this._createOrder({
            action:
              this._direction === cpz.PositionDirection.long
                ? cpz.TradeAction.closeLong
                : cpz.TradeAction.closeShort,
            orderType: cpz.OrderType.forceMarket
          });
          this._ordersToCreate.push(order);
        }
      }
    }
    // Position is open, but there is no exit signal
    if (
      this._entryStatus === cpz.UserPositionOrderStatus.closed &&
      !this._exitStatus
    ) {
      // Creating new exit order to close position
      const order = this._createOrder({
        action:
          this._direction === cpz.PositionDirection.long
            ? cpz.TradeAction.closeLong
            : cpz.TradeAction.closeShort,
        orderType: cpz.OrderType.forceMarket
      });
      this._ordersToCreate.push(order);
    }
    // Position is open, and there was an exit signal
    if (
      this._exitStatus &&
      this._exitStatus !== cpz.UserPositionOrderStatus.closed
    ) {
      // Getting exit open signal orders
      const orders =
        this._exitOrders &&
        this._exitOrders.filter(
          o =>
            (o.status === cpz.OrderStatus.new ||
              o.status === cpz.OrderStatus.open) &&
            o.nextJob.type !== cpz.OrderJobType.cancel &&
            o.type !== cpz.OrderType.forceMarket
        );
      // Exit has open signal orders
      if (orders && orders.length > 0) {
        // Cancel all exit signal orders
        orders.forEach(o => {
          this._orderWithJobs.push({
            id: o.id,
            nextJob: {
              type: cpz.OrderJobType.cancel
            },
            nextJobAt: dayjs.utc().toISOString()
          });
        });
      }

      // Exit hasn't any open signal orders
      if (!this.hasOpenExitOrders) {
        // Creating new exit order to close position
        const order = this._createOrder({
          action:
            this._direction === cpz.PositionDirection.long
              ? cpz.TradeAction.closeLong
              : cpz.TradeAction.closeShort,
          orderType: cpz.OrderType.forceMarket
        });
        this._ordersToCreate.push(order);
      }
    }
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
    }

    if (this._isActionExit(signal.action)) {
      if (this._exitStatus || this._nextJob === cpz.UserPositionJob.close)
        throw new Errors.MoleculerError(
          "Position already closed",
          409,
          "ERR_CONFLICT",
          { userPositionId: this._id }
        );

      if (this._entryStatus !== cpz.UserPositionOrderStatus.closed) {
        this.cancel();
        return;
      }

      if (this._nextJob === cpz.UserPositionJob.cancel) return;
    }
    const order = this._createOrder(signal);

    this._ordersToCreate.push(order);

    if (this._isActionEntry(order.action)) {
      this._entryStatus = cpz.UserPositionOrderStatus.new;
      this._entryVolume = order.volume;
      this._entrySignalPrice = signal.price;
      this._nextJob = cpz.UserPositionJob.open;
      this._nextJobAt = dayjs
        .utc()
        .add(this._robot.tradeSettings.orderTimeout, cpz.TimeUnit.second)
        .toISOString();
      this._entryOrderIds.push(order.id);
    }
    if (this._isActionExit(order.action)) {
      this._exitStatus = cpz.UserPositionOrderStatus.new;
      this._exitVolume = order.volume;
      this._exitSignalPrice = signal.price;
      this._nextJob = cpz.UserPositionJob.close;
      this._nextJobAt = dayjs
        .utc()
        .add(this._robot.tradeSettings.orderTimeout, cpz.TimeUnit.second)
        .toISOString();
      this._exitOrderIds.push(order.id);
    }
  }

  handleOrder(order: cpz.Order) {
    if (this._isActionEntry(order.action)) {
      this._entryDate = order.exLastTradeAt || order.exTimestamp;
      this._updateEntry();
    } else {
      this._exitDate = order.exLastTradeAt || order.exTimestamp;
      this._updateExit();
    }

    this._setStatus();
  }

  executeJob() {
    if (this._nextJob === cpz.UserPositionJob.open) {
      if (
        this._entryStatus === cpz.UserPositionOrderStatus.closed ||
        (this._entryExecuted && this._entryExecuted === this._entryVolume)
      )
        return;

      if (!this.hasOpenEntryOrders) {
        const [canceledOrder] = this._entryOrders.filter(
          o => o.status === cpz.OrderStatus.canceled
        );
        if (canceledOrder) {
          if (
            this.hasEntrySlippage &&
            this._internalState.entrySlippageCount <
              this._robot.tradeSettings.slippage.entry.count
          ) {
            this._orderWithJobs.push({
              id: canceledOrder.id,
              nextJob: {
                type: cpz.OrderJobType.recreate,
                data: {
                  price: this._setPrice({
                    action: canceledOrder.action,
                    orderType: canceledOrder.type,
                    price: canceledOrder.signalPrice
                  })
                }
              },
              nextJobAt: dayjs.utc().toISOString()
            });
          } else {
            if (this._entryExecuted) {
              this._entryStatus = cpz.UserPositionOrderStatus.closed;
              this._setStatus();
            } else {
              this._entryStatus = cpz.UserPositionOrderStatus.canceled;
              this._setStatus();
            }
          }
        }
      }
    } else if (this._nextJob === cpz.UserPositionJob.close) {
      if (
        this._exitStatus === cpz.UserPositionOrderStatus.closed ||
        (this._exitExecuted && this._exitExecuted === this._exitVolume)
      )
        return;

      if (!this.hasOpenExitOrders) {
        const [canceledOrder] = this._exitOrders.filter(
          o => o.status === cpz.OrderStatus.canceled
        );
        if (canceledOrder) {
          if (
            this.hasExitSlippage &&
            this._internalState.exitSlippageCount <
              this._robot.tradeSettings.slippage.exit.count
          ) {
            this._orderWithJobs.push({
              id: canceledOrder.id,
              nextJob: {
                type: cpz.OrderJobType.recreate,
                data: {
                  price: this._setPrice({
                    action: canceledOrder.action,
                    orderType: canceledOrder.type,
                    price: canceledOrder.signalPrice
                  })
                }
              },
              nextJobAt: dayjs.utc().toISOString()
            });
          } else {
            this._cancelPosition();
          }
        } else {
          this._cancelPosition();
        }
      }
    } else if (this._nextJob === cpz.UserPositionJob.cancel) {
      this._cancelPosition();
    }
  }
}

export = UserPosition;

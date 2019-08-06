import { v4 as uuid } from "uuid";
import { sortAsc } from "../../utils";
import { cpz } from "../../types/cpz";

/** TODO: actions переименовать в signals
signal в tradeSignal

объявить тип для класса после рефакторинга
*/

class Position extends cpz.RobotPosition {
  constructor(state: any) {
    super();
    this._id = state.id || uuid();
    this._prefix = state.prefix;
    this._code = state.code;
    this._parentId = state.parentId;
    this._direction = state.direction;
    this._entry = state.entry || {
      status: null,
      price: null,
      date: null,
      orderType: null,
      action: null
    };
    this._exit = state.exit || {
      status: null,
      price: null,
      date: null,
      orderType: null,
      action: null
    };
    this._status = state.status || cpz.RobotPositionStatus.new;
    this._actions = state.actions || {};
    this._signal = null;
    this._candle = null;
  }

  _id: string;
  _prefix: string;
  _code: string;
  _parentId: string;
  _direction: string;
  _entry: {
    status: string;
    price: number;
    date: string;
    orderType: string;
    action: string;
  };
  _exit: {
    status: string;
    price: number;
    date: string;
    orderType: string;
    action: string;
  };
  _status: string;
  _actions: {
    [key: string]: {
      action: cpz.TradeAction;
      price: number;
      orderType: cpz.OrderType;
    };
  };
  _signal: any;
  _candle: cpz.Candle;

  get id() {
    return this._id;
  }

  get prefix() {
    return this._prefix;
  }

  get code() {
    return this._code;
  }

  get parentId() {
    return this._parentId;
  }

  get direction() {
    return this._direction;
  }

  get entry() {
    return this._entry;
  }

  get exit() {
    return this._exit;
  }

  get status() {
    return this._status;
  }

  get isActive() {
    return this._status === cpz.RobotPositionStatus.open;
  }

  get signal() {
    return this._signal;
  }

  _clearSignal() {
    this._signal = null;
  }

  _clearActions() {
    this._actions = {};
  }

  get hasActions() {
    return Object.keys(this._actions).length > 0;
  }

  get state() {
    return {
      id: this._id,
      prefix: this._prefix,
      code: this._code,
      parentId: this._parentId,
      direction: this._direction,
      entry: this._entry,
      exit: this._exit,
      status: this._status,
      actions: this._actions
    };
  }

  setStatus() {
    if (
      this._entry.status === cpz.RobotTradeStatus.closed &&
      this._exit.status === cpz.RobotTradeStatus.closed
    ) {
      this._status = cpz.RobotPositionStatus.closed;
    } else if (this._entry.status === cpz.RobotTradeStatus.closed) {
      this._status = cpz.RobotPositionStatus.open;
    } else {
      this._status = cpz.RobotPositionStatus.new;
    }
  }

  _handleCandle(candle: cpz.Candle) {
    this._candle = candle;
  }

  _checkOpen() {
    if (this._entry.status === cpz.RobotTradeStatus.closed) {
      throw new Error(`Position ${this._code} is already open`);
    }
  }

  _checkClose() {
    if (this._entry.status !== cpz.RobotTradeStatus.closed) {
      throw new Error(`Position ${this._code} is not open`);
    }
    if (this._exit.status === cpz.RobotTradeStatus.closed) {
      throw new Error(`Position ${this._code} is already closed`);
    }
  }

  _addAction(action: cpz.TradeAction, price: number, orderType: cpz.OrderType) {
    this._actions[this._nextActionNumb] = {
      action,
      price,
      orderType
    };
  }

  _createSignal({
    action,
    price,
    orderType
  }: {
    action: cpz.TradeAction;
    price: number;
    orderType: cpz.OrderType;
  }) {
    this._signal = {
      action,
      orderType,
      price,
      position: {
        id: this._id,
        prefix: this._prefix,
        code: this._code,
        parentId: this._parentId
      }
    };
  }

  open({
    action,
    price = this._candle.close,
    orderType
  }: {
    action: cpz.TradeAction;
    price: number;
    orderType: cpz.OrderType;
  }) {
    this._checkOpen();
    this._entry = {
      status: cpz.RobotTradeStatus.closed,
      price,
      date: this._candle.timestamp,
      orderType,
      action
    };
    this._direction = action;
    this.setStatus();

    this._createSignal({ action, price, orderType });
  }

  close({
    price = this._candle.close,
    orderType
  }: {
    price: number;
    orderType: cpz.OrderType;
  }) {
    this._checkClose();
    const action =
      this._direction === cpz.TradeAction.long
        ? cpz.TradeAction.closeLong
        : cpz.TradeAction.closeShort;
    this._exit = {
      status: cpz.RobotTradeStatus.closed,
      price,
      date: this._candle.timestamp,
      orderType,
      action
    };

    this.setStatus();

    this._createSignal({ action, price, orderType });
  }

  get _nextActionNumb() {
    return Object.keys(this._actions).length + 1;
  }

  _runActions() {
    for (const key of Object.keys(this._actions).sort((a, b) =>
      sortAsc(+a, +b)
    )) {
      const action = this._actions[key];
      const success = this._executeAction(action);
      if (success) {
        this._actions = {};
        break;
      }
    }
  }

  _executeAction({
    action,
    price,
    orderType
  }: {
    action: cpz.TradeAction;
    price: number;
    orderType: cpz.OrderType;
  }) {
    let nextPrice = null;
    switch (orderType) {
      case cpz.OrderType.stop: {
        nextPrice = this._checkStop({ action, price });
        break;
      }
      case cpz.OrderType.limit: {
        nextPrice = this._checkLimit({ action, price });
        break;
      }
      case cpz.OrderType.market: {
        nextPrice = this._checkMarket({ action, price });
        break;
      }
      default:
        throw new Error(`Unknown order type ${orderType}`);
    }
    if (nextPrice) {
      if (action === cpz.TradeAction.long || action === cpz.TradeAction.short) {
        this.open({ action, price: nextPrice, orderType });
        return true;
      }
      this.close({ price: nextPrice, orderType });
      return true;
    }
    return false;
  }

  _checkMarket({ action, price }: { action: cpz.TradeAction; price: number }) {
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

  _checkStop({ action, price }: { action: cpz.TradeAction; price: number }) {
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

  _checkLimit({
    action,
    price
  }: {
    action: cpz.TradeAction;
    price: number;
  }): number {
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

  buyAtMarket(price = this._candle.close) {
    this._checkOpen();
    this._addAction(cpz.TradeAction.long, price, cpz.OrderType.market);
  }

  sellAtMarket(price = this._candle.close) {
    this._checkClose();
    this._addAction(cpz.TradeAction.closeLong, price, cpz.OrderType.market);
  }

  shortAtMarket(price = this._candle.close) {
    this._checkOpen();
    this._addAction(cpz.TradeAction.short, price, cpz.OrderType.market);
  }

  coverAtMarket(price = this._candle.close) {
    this._checkClose();
    this._addAction(cpz.TradeAction.closeShort, price, cpz.OrderType.market);
  }

  buyAtStop(price = this._candle.close) {
    this._checkOpen();
    this._addAction(cpz.TradeAction.long, price, cpz.OrderType.stop);
  }

  sellAtStop(price = this._candle.close) {
    this._checkClose();
    this._addAction(cpz.TradeAction.closeLong, price, cpz.OrderType.stop);
  }

  shortAtStop(price = this._candle.close) {
    this._checkOpen();
    this._addAction(cpz.TradeAction.short, price, cpz.OrderType.stop);
  }

  coverAtStop(price = this._candle.close) {
    this._checkClose();
    this._addAction(cpz.TradeAction.closeShort, price, cpz.OrderType.stop);
  }

  buyAtLimit(price = this._candle.close) {
    this._checkOpen();
    this._addAction(cpz.TradeAction.long, price, cpz.OrderType.limit);
  }

  sellAtLimit(price = this._candle.close) {
    this._checkClose();
    this._addAction(cpz.TradeAction.closeLong, price, cpz.OrderType.limit);
  }

  shortAtLimit(price = this._candle.close) {
    this._checkOpen();
    this._addAction(cpz.TradeAction.short, price, cpz.OrderType.limit);
  }

  coverAtLimit(price = this._candle.close) {
    this._checkClose();
    this._addAction(cpz.TradeAction.closeShort, price, cpz.OrderType.limit);
  }
}

export = Position;

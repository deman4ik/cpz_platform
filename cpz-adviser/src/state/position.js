import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import {
  POS_STATUS_NEW,
  POS_STATUS_OPEN,
  POS_STATUS_CLOSED,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP,
  ORDER_TYPE_MARKET,
  ORDER_STATUS_CLOSED,
  TRADE_ACTION_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_LONG,
  TRADE_ACTION_CLOSE_SHORT
} from "cpz/config/state";
import { sortAsc } from "cpz/utils/helpers";

class Position {
  constructor(state) {
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
    this._status = state.status || POS_STATUS_NEW;
    this._actions = state.actions || {};
    this._signal = null;
    this._candle = {};
  }

  get id() {
    return this._id;
  }

  get numb() {
    return this._numb;
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
    return this._status === POS_STATUS_OPEN;
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
      this._entry.status === ORDER_STATUS_CLOSED &&
      this._exit.status === ORDER_STATUS_CLOSED
    ) {
      this._status = POS_STATUS_CLOSED;
    } else if (this._entry.status === ORDER_STATUS_CLOSED) {
      this._status = POS_STATUS_OPEN;
    } else {
      this._status = POS_STATUS_NEW;
    }
  }

  _handleCandle(candle) {
    this._candle = candle;
  }

  _checkOpen() {
    if (this._entry.status === ORDER_STATUS_CLOSED) {
      throw new Error(`Position ${this._code} is already open`);
    }
  }

  _checkClose() {
    if (this._entry.status !== ORDER_STATUS_CLOSED) {
      throw new Error(`Position ${this._code} is not open`);
    }
    if (this._exit.status === ORDER_STATUS_CLOSED) {
      throw new Error(`Position ${this._code} is already closed`);
    }
  }

  _addAction(action, price, orderType) {
    this._actions[this._nextActionNumb] = {
      action,
      price,
      orderType
    };
  }

  _createSignal({ action, price, orderType }) {
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

  open({ action, price = this._candle.close, orderType }) {
    Log.debug(`position ${this._code}.open`, action, price, orderType);
    this._checkOpen();
    this._entry = {
      status: ORDER_STATUS_CLOSED,
      price,
      date: this._candle.timestamp,
      orderType,
      action
    };
    this._direction = action;
    this.setStatus();

    this._createSignal({ action, price, orderType });
  }

  close({ price = this._candle.close, orderType }) {
    Log.debug(`position ${this._code}.close`, price, orderType);
    this._checkClose();
    const action =
      this._direction === TRADE_ACTION_LONG
        ? TRADE_ACTION_CLOSE_LONG
        : TRADE_ACTION_CLOSE_SHORT;
    this._exit = {
      status: ORDER_STATUS_CLOSED,
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
    /* eslint-disable no-restricted-syntax */
    for (const key of Object.keys(this._actions).sort((a, b) =>
      sortAsc(a, b)
    )) {
      const action = this._actions[key];
      const success = this._executeAction(action);
      if (success) {
        this._actions = {};
        break;
      }
    }
    /* no-restricted-syntax */
  }

  _executeAction({ action, price, orderType }) {
    let nextPrice = null;
    switch (orderType) {
      case ORDER_TYPE_STOP: {
        nextPrice = this._checkStop({ action, price });
        break;
      }
      case ORDER_TYPE_LIMIT: {
        nextPrice = this._checkLimit({ action, price });
        break;
      }
      case ORDER_TYPE_MARKET: {
        nextPrice = this._checkMarket({ action, price });
        break;
      }
      default:
        throw new Error(`Unknown order type ${orderType}`);
    }
    if (nextPrice) {
      if (action === TRADE_ACTION_LONG || action === TRADE_ACTION_SHORT) {
        this.open({ action, price: nextPrice, orderType });
        return true;
      }
      this.close({ price: nextPrice, orderType });
      return true;
    }
    return false;
  }

  _checkMarket({ action, price }) {
    Log.debug(
      `position ${this._code}._checkMarket`,
      action,
      price,
      " # ",
      `o: ${this._candle.open}, h: ${this._candle.high}, l: ${
        this._candle.low
      }, c: ${this._candle.close}`,
      "time:",
      this._candle.timestamp
    );
    if (action === TRADE_ACTION_LONG || action === TRADE_ACTION_CLOSE_SHORT) {
      return Math.max(this._candle.open, price);
    }
    if (action === TRADE_ACTION_SHORT || action === TRADE_ACTION_CLOSE_LONG) {
      return Math.min(this._candle.open, price);
    }
    throw new Error(`Unknown action ${action}`);
  }

  _checkStop({ action, price }) {
    Log.debug(
      `position ${this._code}._checkStop`,
      action,
      price,
      " # ",
      `o: ${this._candle.open}, h: ${this._candle.high}, l: ${
        this._candle.low
      }, c: ${this._candle.close}`,
      "time:",
      this._candle.timestamp
    );
    if (action === TRADE_ACTION_LONG || action === TRADE_ACTION_CLOSE_SHORT) {
      if (this._candle.high >= price) return Math.max(this._candle.open, price);
    } else if (
      action === TRADE_ACTION_SHORT ||
      action === TRADE_ACTION_CLOSE_LONG
    ) {
      if (this._candle.low <= price) return Math.min(this._candle.open, price);
    } else {
      throw new Error(`Unknown action ${action}`);
    }
    return false;
  }

  _checkLimit({ action, price }) {
    Log.debug(
      `position ${this._code}._checkLimit`,
      action,
      price,
      " # ",
      `o: ${this._candle.open}, h: ${this._candle.high}, l: ${
        this._candle.low
      }, c: ${this._candle.close}`,
      "time:",
      this._candle.timestamp
    );
    if (action === TRADE_ACTION_LONG || action === TRADE_ACTION_CLOSE_SHORT) {
      if (this._candle.high <= price) return Math.min(this._candle.open, price);
    } else if (
      action === TRADE_ACTION_SHORT ||
      action === TRADE_ACTION_CLOSE_LONG
    ) {
      if (this._candle.low >= price) return Math.max(this._candle.open, price);
    } else {
      throw new Error(`Unknown action ${action}`);
    }
    return false;
  }

  buyAtMarket(price = this._candle.close) {
    Log.debug(`position ${this._code}.buyAtMarket`, price);
    this._checkOpen();
    this._addAction(TRADE_ACTION_LONG, price, ORDER_TYPE_MARKET);
  }

  sellAtMarket(price = this._candle.close) {
    Log.debug(`position ${this._code}.sellAtMarket`, price);
    this._checkClose();
    this._addAction(TRADE_ACTION_CLOSE_LONG, price, ORDER_TYPE_MARKET);
  }

  shortAtMarket(price = this._candle.close) {
    Log.debug(`position ${this._code}.shortAtMarket`, price);
    this._checkOpen();
    this._addAction(TRADE_ACTION_SHORT, price, ORDER_TYPE_MARKET);
  }

  coverAtMarket(price = this._candle.close) {
    Log.debug(`position ${this._code}.coverAtMarket`, price);
    this._checkClose();
    this._addAction(TRADE_ACTION_CLOSE_SHORT, price, ORDER_TYPE_MARKET);
  }

  buyAtStop(price = this._candle.close) {
    Log.debug(`position ${this._code}.buyAtStop`, price);
    this._checkOpen();
    this._addAction(TRADE_ACTION_LONG, price, ORDER_TYPE_STOP);
  }

  sellAtStop(price = this._candle.close) {
    Log.debug(`position ${this._code}.sellAtStop`, price);
    this._checkClose();
    this._addAction(TRADE_ACTION_CLOSE_LONG, price, ORDER_TYPE_STOP);
  }

  shortAtStop(price = this._candle.close) {
    Log.debug(`position ${this._code}.shortAtStop`, price);
    this._checkOpen();
    this._addAction(TRADE_ACTION_SHORT, price, ORDER_TYPE_STOP);
  }

  coverAtStop(price = this._candle.close) {
    Log.debug(`position ${this._code}.coverAtStop`, price);
    this._checkClose();
    this._addAction(TRADE_ACTION_CLOSE_SHORT, price, ORDER_TYPE_STOP);
  }

  buyAtLimit(price = this._candle.close) {
    Log.debug(`position ${this._code}.buyAtLimit`, price);
    this._checkOpen();
    this._addAction(TRADE_ACTION_LONG, price, ORDER_TYPE_LIMIT);
  }

  sellAtLimit(price = this._candle.close) {
    Log.debug(`position ${this._code}.sellAtLimit`, price);
    this._checkClose();
    this._addAction(TRADE_ACTION_CLOSE_LONG, price, ORDER_TYPE_LIMIT);
  }

  shortAtLimit(price = this._candle.close) {
    Log.debug(`position ${this._code}.shortAtLimit`, price);
    this._checkOpen();
    this._addAction(TRADE_ACTION_SHORT, price, ORDER_TYPE_LIMIT);
  }

  coverAtLimit(price = this._candle.close) {
    Log.debug(`position ${this._code}.coverAtLimit`, price);
    this._checkClose();
    this._addAction(TRADE_ACTION_CLOSE_SHORT, price, ORDER_TYPE_LIMIT);
  }
}

export default Position;

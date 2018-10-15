import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import {
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_SHORT,
  POSITION_OPEN,
  POSITION_OPENING,
  POSITION_CLOSE,
  POSITION_CLOSING,
  ORDER_TYPE_MARKET,
  ORDER_CLOSED,
  ORDER_OPEN
} from "cpzState";

class Position {
  constructor(state) {
    /* Уникальный идентификатор позиции */
    this._positionId = state.positionId || uuid();
    /* Идентификатор проторговщика */
    this._traderId = state.traderId;
    /* Идентификатор робота */
    this._robotId = state.robotId;
    /* Идентификатор пользователя */
    this._userId = state.userId;
    /* Идентификатор советника */
    this._adviserId = state.adviserId;
    /* Код биржи */
    this._exchange = state.exchange;
    /* Идентификатор биржи */
    this._exchangeId = state.exchangeId;
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Таймфрейм */
    this._timeframe = state.timeframe;
    /* Шаг проскальзывания */
    this._slippageStep = state.slippageStep;
    /* Отклонение цены */
    this._deviation = state.deviation;
    /* Текущий статус */
    this._status = state.status;
    /* Открытые ордера */
    this._openOrders = state.openOrders || [];
    /* Закрытые ордера */
    this._closedOrder = state.closedOrders || [];
  }

  _createOrder(signal) {
    this._currentOrder = {
      signalId: signal.signalId,
      orderType: signal.orderType,
      price: signal.price,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      createdAt: dayjs().toJSON(),
      status:
        signal.orderType === ORDER_TYPE_MARKET ? ORDER_CLOSED : ORDER_OPEN,
      direction:
        signal.action === TRADE_ACTION_CLOSE_SHORT ||
        signal.action === TRADE_ACTION_LONG
          ? "buy"
          : "sell",
      action: signal.action
    };
  }

  createOpenOrder(signal) {
    this._createOrder(signal);
    this._openOrders.push(this._currentOrder);
    this._status =
      signal.orderType === ORDER_TYPE_MARKET ? POSITION_OPEN : POSITION_OPENING;
  }

  createCloseOrder(signal) {
    this._createOrder(signal);
    this._closeOrders.push(this._currentOrder);
    this._status =
      signal.orderType === ORDER_TYPE_MARKET
        ? POSITION_CLOSE
        : POSITION_CLOSING;
  }
}

export default Position;

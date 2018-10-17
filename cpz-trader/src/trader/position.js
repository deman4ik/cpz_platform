import { v4 as uuid } from "uuid";
import VError from "verror";
import dayjs from "dayjs";
import {
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_SHORT,
  POS_STATUS_NONE,
  POS_STATUS_ACTIVE,
  POS_STATUS_POSTED,
  POS_STATUS_CANCELED,
  POS_STATUS_ERROR,
  POS_STATUS_PENDING,
  ORDER_TYPE_MARKET,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_POSTED,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_STOP,
  ORDER_TASK_OPENBYMARKET,
  ORDER_TASK_SETLIMIT,
  ORDER_TASK_CHECKLIMIT,
  ORDER_DIRECTION_BUY,
  ORDER_DIRECTION_SELL,
  ORDER_POS_DIR_OPEN,
  ORDER_POS_DIR_CLOSE
} from "cpzState";
import { createTraderSlug } from "cpzStorage/utils";
import { modeToStr } from "cpzUtils/helpers";
import { savePositionState } from "../tableStorage";

class Position {
  constructor(state) {
    /* Режим работы ['backtest', 'emulator', 'realtime'] */
    this._mode = state.mode;
    /* Уникальный идентификатор позиции */
    this._positionId = state.positionId;
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
    /* Текущий статус ["active","done","canceled","error"] */
    this._status = state.status || POS_STATUS_ACTIVE;
    /* Текущий статус открытия ["none", "pending","done","canceled","error"] */
    this._openStatus = state.openStatus || POS_STATUS_NONE;
    /* Текущий статус закрытия ["none", "pending","done","canceled","error"] */
    this._closeStatus = state.closeStatus || POS_STATUS_NONE;
    /* Ордера открытия */
    this._openOrders = state.openOrders || [];
    /* Ордера закрытия */
    this._closedOrder = state.closedOrders || [];
  }

  get positionId() {
    return this._positionId;
  }

  get traderId() {
    return this._traderId;
  }

  get robotId() {
    return this._robotId;
  }

  get slug() {
    return createTraderSlug(
      this._exchange,
      this._asset,
      this._currency,
      this._timeframe,
      modeToStr(this._mode)
    );
  }

  get currentOrder() {
    return this._currentOrder;
  }

  /**
   * Создать ордер из сигнала
   *
   * @param {*} signal
   */
  _createOrder(signal, positionDirection) {
    this._currentOrder = {
      orderId: uuid(),
      signalId: signal.signalId,
      orderType: signal.orderType,
      price: signal.price,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      createdAt: dayjs().toJSON(),
      status: ORDER_STATUS_PENDING,
      direction:
        signal.action === TRADE_ACTION_CLOSE_SHORT ||
        signal.action === TRADE_ACTION_LONG
          ? ORDER_DIRECTION_BUY
          : ORDER_DIRECTION_SELL,
      positionDirection,
      action: signal.action,
      task: null
    };
  }

  /**
   * Создать ордер на открытие позиции из сигнала
   *
   * @param {*} signal
   */
  createOpenOrder(signal) {
    this._createOrder(signal, ORDER_POS_DIR_OPEN);
    this._openOrders.push(this._currentOrder);
    this._openStatus = POS_STATUS_PENDING;
  }

  /**
   * Создать ордер на закрытие позиции из сигнала
   *
   * @param {*} signal
   */
  createCloseOrder(signal) {
    this._createOrder(signal, ORDER_POS_DIR_CLOSE);
    this._closeOrders.push(this._currentOrder);
    this._closeStatus = POS_STATUS_PENDING;
  }

  /**
   * Проверить ордер по текущей цене
   *
   * @param {*} order
   * @param {*} price
   */
  _checkOrder(order, price) {
    // Ордер ожидает обработки
    if (order.status === ORDER_STATUS_PENDING) {
      // Тип ордера - лимитный
      if (order.orderType === ORDER_TYPE_LIMIT) {
        // Если покупаем
        if (order.direction === ORDER_DIRECTION_BUY) {
          // Если проскальзывание текущей цены меньше или равно заданного
          if (price - order.price <= order.slippageStep) {
            // Нужно выставить лимитный ордер
            return { ...order, task: ORDER_TASK_SETLIMIT };
          }
        }
        // Если продаем
        if (order.direction === ORDER_DIRECTION_SELL) {
          // Если проскальзывание текущей цены меньше или равно заданного
          if (order.price - price <= order.slippageStep) {
            // Нужно выставить лимитный ордер
            return { ...order, task: ORDER_TASK_SETLIMIT };
          }
        }
        // Тип ордера - стоп
      } else if (order.orderType === ORDER_TYPE_STOP) {
        // Если покупаем
        if (order.direction === ORDER_DIRECTION_BUY) {
          // Цена сигнала с учетом отклонения
          const signalPrice = order.price - order.deviation;
          // Цена ордера с учетом проскальзывания
          const entryPrice = signalPrice + order.slippageStep;
          // Если текущая цена больше или равна цене с учетом отклонения
          if (price >= signalPrice) {
            // Нужно выставить ордер по рынку, по цене с учетом проскальзывания
            return {
              ...order,
              price: entryPrice,
              orderType: ORDER_TYPE_MARKET,
              task: ORDER_TASK_OPENBYMARKET
            };
          }
        }
        // Если продаем
        if (order.direction === ORDER_DIRECTION_SELL) {
          // Цена сигнала с учетом отклонения
          const signalPrice = order.price + order.deviation;
          // Цена ордера с учетом проскальзывания
          const entryPrice = signalPrice - order.slippageStep;
          // Если текущая цена меньше или равна цене с учетом отклонения
          if (price <= signalPrice) {
            // Нужно выставить ордер по рынку, по цене с учетом проскальзывания
            return {
              ...order,
              price: entryPrice,
              orderType: ORDER_TYPE_MARKET,
              task: ORDER_TASK_OPENBYMARKET
            };
          }
        }
      }
      // Ордер уже выставлен
    } else if (order.status === ORDER_STATUS_POSTED) {
      // Если покупаем и текущая цена ниже цены сигнала
      // Если продаем и текущая цена выше цены сигнала
      if (
        (order.direction === ORDER_DIRECTION_BUY && price < order.price) ||
        (order.durection === ORDER_DIRECTION_SELL && price > order.price)
      ) {
        // Нужно проверить ордер на бирже
        return { ...order, task: ORDER_TASK_CHECKLIMIT };
      }
    }
    return null;
  }

  /**
   * Выборка всех ордеров необходимых для обработки
   *
   * @param {*} price
   */
  getRequiredOrders(price) {
    this._requiredOrders = [];
    // Если ордера на открытие позиции ожидают обработки
    if (this._openStatus === POS_STATUS_PENDING) {
      // Проверяем все ордера на открытие позиции ожидающие обработки
      this._openOrders.forEach(order => {
        const checkedOrder = this._checkOrder(order, price);
        if (checkedOrder) this._requiredOrders.push(checkedOrder);
      });
    }
    // Если ордера на закрытие позиции ожидают обработки
    if (this._closeStatus === POS_STATUS_PENDING) {
      // Проверяем все ордера на открытие позиции ожидающие обработки
      this._closeOrders.forEach(order => {
        const checkedOrder = this._checkOrder(order, price);
        if (checkedOrder) this._requiredOrders.push(checkedOrder);
      });
    }
    // Возвращаем массив ордеров для дальнейшей обработки
    return this._requiredOrders;
  }

  handleOrder(order) {
    //! TODO handle orders and update position state
  }

  getCurrentState() {
    return {
      mode: this._mode,
      positionId: this._positionId,
      traderId: this._traderId,
      robotId: this._robotId,
      userId: this._userId,
      adviserId: this._adviserId,
      exchange: this._exchange,
      exchangeId: this._exchangeId,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      slippageStep: this._slippageStep,
      deviation: this._deviation,
      status: this._status,
      openStatus: this._openStatus,
      closeStatus: this._closeStatus,
      openOrders: this._openOrders,
      closedOrders: this._closedOrder
    };
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Position
   */
  async save() {
    this.log(`save()`);
    try {
      // Сохраняем состояние в локальном хранилище
      await savePositionState(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            positionId: this._positionId,
            traderId: this._traderId,
            robotId: this._robotId,
            userId: this._userId,
            adviserId: this._adviserId,
            eventSubject: this._eventSubject
          }
        },
        'Failed to update position "%s" state',
        this._taskId
      );
    }
  }
}

export default Position;

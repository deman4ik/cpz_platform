import { v4 as uuid } from "uuid";
import VError from "verror";
import dayjs from "dayjs";
import {
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_SHORT,
  POS_STATUS_NONE,
  POS_STATUS_OPENED,
  POS_STATUS_CLOSED,
  POS_STATUS_CANCELED,
  POS_STATUS_ERROR,
  ORDER_STATUS_NONE,
  ORDER_STATUS_OPENED,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_POSTED,
  ORDER_STATUS_CANCELED,
  ORDER_STATUS_ERROR,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
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

/**
 * Класс позиции
 *
 * @class Trader
 */
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
    /* Текущий статус ["none","opened","closed","canceled","error"] */
    this._status = state.status || POS_STATUS_NONE;
    /* Текущий статус открытия ["none","opened","posted","closed","canceled","error"] */
    this._openStatus = state.openStatus || ORDER_STATUS_NONE;
    /* Текущий статус закрытия ["none","opened","posted","closed","canceled","error"] */
    this._closeStatus = state.closeStatus || ORDER_STATUS_NONE;
    /* Ордера открытия */
    this._openOrders = state.openOrders || {};
    /* Ордера закрытия */
    this._closedOrder = state.closedOrders || {};
    /* Метаданные стореджа */
    this._metadata = state.metadata;
  }

  /**
   * Уникальный идентификатор позиции
   *
   * @readonly
   * @memberof Position
   */
  get positionId() {
    return this._positionId;
  }

  /**
   * Идентификатор проторговщика
   *
   * @readonly
   * @memberof Position
   */
  get traderId() {
    return this._traderId;
  }

  /**
   * Идентификатор робота
   *
   * @readonly
   * @memberof Position
   */
  get robotId() {
    return this._robotId;
  }

  /**
   * Общий идентификатор позиции (биржа+инструмент+таймфрейм+режим)
   *
   * @readonly
   * @memberof Position
   */
  get slug() {
    return createTraderSlug(
      this._exchange,
      this._asset,
      this._currency,
      this._timeframe,
      modeToStr(this._mode)
    );
  }

  /**
   * Текущий обрабатываемый ордер
   *
   * @readonly
   * @memberof Position
   */
  get currentOrder() {
    return this._currentOrder;
  }

  /**
   * Установка текущего статуса позиции
   *
   * @memberof Position
   */
  setStatus() {
    if (
      this._openStatus === ORDER_STATUS_OPENED ||
      this._closeStatus === ORDER_STATUS_OPENED ||
      this._openStatus === ORDER_STATUS_POSTED ||
      this._closeStatus === ORDER_STATUS_POSTED
    ) {
      this._status = POS_STATUS_OPENED;
    } else if (
      this._openStatus === ORDER_STATUS_CLOSED &&
      this._closeStatus === ORDER_STATUS_CLOSED
    ) {
      this._status = POS_STATUS_CLOSED;
    } else if (
      this._openStatus === ORDER_STATUS_CANCELED ||
      this._closeStatus === ORDER_STATUS_CANCELED
    ) {
      this._status = POS_STATUS_CANCELED;
    } else if (
      this._openStatus === ORDER_STATUS_ERROR ||
      this._closeStatus === ORDER_STATUS_ERROR
    ) {
      this._status = POS_STATUS_ERROR;
    }
  }

  /**
   * Создать ордер из сигнала
   *
   * @param {*} signal
   *
   * @memberof Position
   */
  _createOrder(signal, positionDirection) {
    this._currentOrder = {
      orderId: uuid(), // Уникальный идентификатор ордера
      signalId: signal.signalId, // Идентификатор сигнала
      orderType: signal.orderType, // Тип ордера
      price: signal.price, // Цена ордера
      exchange: this._exchange, // Код биржи
      asset: this._asset, // Базовая валюта
      currency: this._currency, // Котировка валюты
      timeframe: this._timeframe, // Таймфрейм
      createdAt: dayjs().toJSON(), // Дата и время создания
      status: ORDER_STATUS_OPENED, // Статус ордера
      direction:
        signal.action === TRADE_ACTION_CLOSE_SHORT ||
        signal.action === TRADE_ACTION_LONG
          ? ORDER_DIRECTION_BUY
          : ORDER_DIRECTION_SELL, // Направление торговли ордера
      positionDirection, // Место ордера в позиции
      action: signal.action, // Торговое действие
      task: null // Задача ордера
    };
  }

  /**
   * Создать ордер на открытие позиции из сигнала
   *
   * @param {*} signal
   *
   * @memberof Position
   */
  createOpenOrder(signal) {
    // Создаем ордер на открытие позиции
    this._createOrder(signal, ORDER_POS_DIR_OPEN);
    // Сохраняем созданный ордер в списке ордеров на открытие позиции
    this._openOrders[this._currentOrder.orderId] = this._currentOrder;
    // Изменяем статус открытия позиции
    this._openStatus = this._currentOrder.status;
  }

  /**
   * Создать ордер на закрытие позиции из сигнала
   *
   * @param {*} signal
   *
   * @memberof Position
   */
  createCloseOrder(signal) {
    // Создаем ордер на закрытие позиции
    this._createOrder(signal, ORDER_POS_DIR_CLOSE);
    // Сохраняем созданный ордер в списке ордеров на закрытие позиции
    this._closeOrders[this._currentOrder.orderId] = this._currentOrder;
    // Изменяем статус закрытия позиции
    this._closeStatus = this._currentOrder.status;
  }

  /**
   * Проверить ордер по текущей цене
   *
   * @param {*} order
   * @param {*} price
   *
   * @memberof Position
   */
  _checkOrder(order, price) {
    // Ордер ожидает обработки
    if (order.status === ORDER_STATUS_OPENED) {
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
    // Не нужно ничего делать
    return null;
  }

  /**
   * Выборка всех ордеров необходимых для обработки
   *
   * @param {*} price
   *
   * @memberof Position
   */
  getRequiredOrders(price) {
    this._requiredOrders = [];
    // Если ордера на открытие позиции ожидают обработки
    if (this._openStatus === ORDER_STATUS_OPENED) {
      // Проверяем все ордера на открытие позиции ожидающие обработки
      Object.keys(this._openOrders).forEach(key => {
        const order = this._openOrders[key];
        const checkedOrder = this._checkOrder(order, price);
        if (checkedOrder) this._requiredOrders.push(checkedOrder);
      });
    }
    // Если ордера на закрытие позиции ожидают обработки
    if (this._closeStatus === ORDER_STATUS_OPENED) {
      // Проверяем все ордера на открытие позиции ожидающие обработки
      Object.keys(this._closeOrders).forEach(key => {
        const order = this._closeOrders[key];
        const checkedOrder = this._checkOrder(order, price);
        if (checkedOrder) this._requiredOrders.push(checkedOrder);
      });
    }
    // Возвращаем массив ордеров для дальнейшей обработки
    return this._requiredOrders;
  }

  /**
   * Сохранение текущего состояния ордера
   *
   * @param {*} order
   *
   * @memberof Position
   */
  handleOrder(order) {
    // Если ордер на открытие позиции
    if (order.positionDirection === ORDER_POS_DIR_OPEN) {
      // Изменяем статус открытия позиции
      this._openStatus = order.status;
      // Сохраянем ордер в списке ордеров на открытие позиции
      this._openOrders[order.orderId] = order;
    } else {
      // Если ордер на закрытие позиции
      // Изменяем статус закрытия позиции
      this._closeStatus = order.status;
      // Сохраянем ордер в списке ордеров на закрытие позиции
      this._closeStatus[order.orderId] = order;
    }
    // Устанавливаем статус позиции
    this.setStatus();
  }

  /**
   * Запрос всего текущего состояния
   *
   * @memberof Position
   */
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

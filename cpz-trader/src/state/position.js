import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import {
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_SHORT,
  POS_STATUS_NEW,
  POS_STATUS_OPEN,
  POS_STATUS_CLOSED,
  POS_STATUS_CLOSED_AUTO,
  POS_STATUS_CANCELED,
  POS_STATUS_ERROR,
  ORDER_STATUS_NEW,
  ORDER_STATUS_OPEN,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_CANCELED,
  ORDER_STATUS_ERROR,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_MARKET_FORCE,
  ORDER_TASK_OPENBYMARKET,
  ORDER_TASK_SETLIMIT,
  ORDER_TASK_CHECKLIMIT,
  ORDER_DIRECTION_BUY,
  ORDER_DIRECTION_SELL,
  ORDER_POS_DIR_ENTRY,
  ORDER_POS_DIR_EXIT
} from "cpz/config/state";
import dayjs from "cpz/utils/lib/dayjs";

/**
 * Класс позиции
 *
 * @class Trader
 */
class Position {
  constructor(state) {
    /* Уникальный идентификатор позиции */
    this._id = state.id;
    this._code = state.code;
    this._direction = state.direction;
    /* Текущий статус ["new","open","closed","closedAuto","canceled","error"] */
    this._status = state.status || POS_STATUS_NEW;
    this._entry = state.entry || {
      /* Текущий статус открытия ["new","open","closed","canceled","error"] */
      status: null,
      price: null,
      date: null,
      executed: null,
      remaining: null
    };

    this._exit = state.exit || {
      /* Текущий статус закрытия ["new","open","closed","canceled","error"] */
      status: null,
      price: null,
      date: null,
      executed: null,
      remaining: null
    };
    /* Ордера открытия */
    this._entryOrders = state.entryOrders || {};
    /* Ордера закрытия */
    this._exitOrders = state.exitOrders || {};
  }

  /**
   * Уникальный идентификатор позиции
   *
   * @readonly
   * @memberof Position
   */
  get id() {
    return this._id;
  }

  get status() {
    return this._status;
  }

  set status(status) {
    this._status = status;
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
      this._entry.status === ORDER_STATUS_OPEN ||
      this._entry.status === ORDER_STATUS_CLOSED ||
      this._exit.status === ORDER_STATUS_OPEN
    ) {
      this._status = POS_STATUS_OPEN;
    }
    if (
      this._entry.status === ORDER_STATUS_CLOSED &&
      this._exit.status === ORDER_STATUS_CLOSED
    ) {
      this._status = POS_STATUS_CLOSED;
    } else if (
      this._entry.status === POS_STATUS_CLOSED &&
      this._exit.status === POS_STATUS_CLOSED_AUTO
    ) {
      this._status = POS_STATUS_CLOSED_AUTO;
    }
    if (
      this._entry.status === ORDER_STATUS_CANCELED ||
      this._exit.status === ORDER_STATUS_CANCELED
    ) {
      this._status = POS_STATUS_CANCELED;
    }
    if (
      this._entry.status === ORDER_STATUS_ERROR ||
      this._exit.status === ORDER_STATUS_ERROR
    ) {
      this._status = POS_STATUS_ERROR;
    }
  }

  /**
   * Создать ордер из сигнала
   *
   * @param {object} signal
   * @param {string} positionDirection entry/exit
   * @param {object} settings Trader Settings
   *
   * @memberof Position
   */
  _createOrder(signal, positionDirection, settings) {
    Log.debug("Creating new order...");
    const {
      signalId,
      orderType,
      price,
      action,
      settings: { volume: signalVolume }
    } = signal;
    this._currentOrder = {
      orderId: uuid(), // Уникальный идентификатор ордера
      signalId, // Идентификатор сигнала
      positionId: this._id, // Идентификатор позиции
      orderType, // Тип ордера
      price, // Цена ордера
      volume:
        signalVolume ||
        (positionDirection === ORDER_POS_DIR_EXIT && this._entry.executed) ||
        settings.volume,
      createdAt: dayjs.utc().toISOString(), // Дата и время создания
      status: ORDER_STATUS_NEW, // Статус ордера
      direction:
        action === TRADE_ACTION_LONG || action === TRADE_ACTION_CLOSE_SHORT
          ? ORDER_DIRECTION_BUY
          : ORDER_DIRECTION_SELL, // Направление торговли ордера
      positionDirection, // Место ордера в позиции
      action, // Торговое действие
      task:
        orderType === ORDER_TYPE_MARKET || orderType === ORDER_TYPE_MARKET_FORCE
          ? ORDER_TASK_OPENBYMARKET
          : null, // Задача ордера
      error: null // Ошибка выполнения ордера
    };
  }

  /**
   * Создать ордер на вход в позицию
   *
   * @param {object} signal
   * @param {object} settings Trader settings
   *
   * @memberof Position
   */
  createEntryOrder(signal, settings) {
    // Создаем ордер на открытие позиции
    this._createOrder(signal, ORDER_POS_DIR_ENTRY, settings);
    // Сохраняем созданный ордер в списке ордеров на открытие позиции
    this._entryOrders[this._currentOrder.orderId] = this._currentOrder;
    // Изменяем статус открытия позиции
    this._entry.status = this._currentOrder.status;
    this._entry.price = this._currentOrder.price;
    this._entry.date = this._currentOrder.createdAt;
    this._entry.executed = this._currentOrder.executed;
    this._entry.remaining = this._currentOrder.remaining;
    // Устанавливаем статус позиции
    this.setStatus();
  }

  /**
   * Создать ордер на выход из позиции
   *
   * @param {object} signal
   * @param {object} settings Trader settings
   *
   * @memberof Position
   */
  createExitOrder(signal, settings) {
    // Создаем ордер на закрытие позиции
    this._createOrder(signal, ORDER_POS_DIR_EXIT, settings);
    // Сохраняем созданный ордер в списке ордеров на закрытие позиции
    this._exitOrders[this._currentOrder.orderId] = this._currentOrder;
    // Изменяем статус закрытия позиции
    this._exit.status = this._currentOrder.status;
    this._exit.price = this._currentOrder.price;
    this._exit.date = this._currentOrder.createdAt;
    this._exit.executed = this._currentOrder.executed;
    this._exit.remaining = this._currentOrder.remaining;
    // Устанавливаем статус позиции
    this.setStatus();
  }

  /**
   * Проверить ордер по текущей цене
   *
   * @param {object} order
   * @param {number} price
   * @param {object} settings Trader settings
   *
   * @memberof Position
   */
  _checkOrder(order, price, settings) {
    Log.debug(
      `checkOrder() ${order.orderId}, position: ${this._code}, status: ${
        order.status
      }, posDir: ${order.positionDirection}, dir: ${order.direction}, task: ${
        order.task
      }, order price: ${order.price}, current price: ${price}`
    );
    // Ордер ожидает обработки
    if (order.status === ORDER_STATUS_NEW) {
      // Тип ордера - лимитный
      if (order.orderType === ORDER_TYPE_LIMIT) {
        // Если покупаем
        if (order.direction === ORDER_DIRECTION_BUY) {
          if (price <= order.price) {
            // Нужно выставить лимитный ордер
            return {
              ...order,
              price: order.price + settings.slippageStep,
              task: ORDER_TASK_SETLIMIT
            };
          }
        }
        // Если продаем
        if (order.direction === ORDER_DIRECTION_SELL) {
          if (price >= order.price) {
            // Нужно выставить лимитный ордер
            return {
              ...order,
              price: order.price - settings.slippageStep,
              task: ORDER_TASK_SETLIMIT
            };
          }
        }
      }
      // Ордер уже выставлен
    } else if (order.status === ORDER_STATUS_OPEN) {
      // Если покупаем и текущая цена ниже цены сигнала
      // Если продаем и текущая цена выше цены сигнала
      if (
        (order.direction === ORDER_DIRECTION_BUY && price <= order.price) ||
        (order.direction === ORDER_DIRECTION_SELL && price >= order.price)
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
   * @param {number} price
   * @param {object} settings Trader settings
   *
   * @memberof Position
   */
  getOrdersToExecute(price, settings) {
    Log.debug(
      `getOrdersToExecute() position: ${this._code}, entry: ${
        this._entry.status
      }, exit: ${this._exit.status}, price: ${price}`
    );
    let requiredOrders = [];

    if (
      this._entry.status === ORDER_STATUS_NEW ||
      this._entry.status === ORDER_STATUS_OPEN
    ) {
      // Если ордера на открытие позиции ожидают обработки
      // Проверяем все ордера на открытие позиции ожидающие обработки
      requiredOrders = Object.values(this._entryOrders)
        .map(order => this._checkOrder(order, price, settings))
        .filter(order => !!order);
    } else if (
      this._entry.status === ORDER_STATUS_CLOSED &&
      (this._exit.status === ORDER_STATUS_NEW ||
        this._exit.status === ORDER_STATUS_OPEN)
    ) {
      // Если ордера на открытие позиции исполнены и ордера на закрытие позиции ожидают обработки
      // Проверяем все ордера на закрытие позиции ожидающие обработки
      requiredOrders = Object.values(this._exitOrders)
        .map(order => this._checkOrder(order, price, settings))
        .filter(order => !!order);
    }
    if (requiredOrders.length > 0) {
      Log.debug(
        `${requiredOrders.length} order required position ${
          this._code
        }, price: ${price}`
      );
    }
    // Возвращаем массив ордеров для дальнейшей обработки
    return requiredOrders;
  }

  /**
   * Выборка открытых ордеров, которые необходимо проверить не бирже
   *
   * @returns
   * @memberof Position
   */
  getOpenOrders() {
    let openOrders = [];

    if (this._entry.status === ORDER_STATUS_OPEN) {
      // Если ордера на открытие позиции ожидают обработки
      // Проверяем все ордера на открытие позиции ожидающие обработки
      openOrders = Object.values(this._entryOrders)
        .filter(order => order.status === ORDER_STATUS_OPEN)
        .map(order => ({ ...order, task: ORDER_TASK_CHECKLIMIT }));
    } else if (this._exit.status === ORDER_STATUS_OPEN) {
      // Если ордера на закрытие позиции ожидают обработки
      // Проверяем все ордера на закрытие позиции ожидающие обработки
      openOrders = Object.values(this._exitOrders)
        .filter(order => order.status === ORDER_STATUS_OPEN)
        .map(order => ({ ...order, task: ORDER_TASK_CHECKLIMIT }));
    }
    // Возвращаем массив ордеров для дальнейшей обработки
    return openOrders;
  }

  /**
   * Сохранение текущего состояния ордера
   *
   * @param {*} order
   *
   * @memberof Position
   */
  handleOrder(order) {
    Log.debug(
      `Executed ${order.orderId}, position: ${this._code}, status: ${
        order.status
      }, posDir: ${order.positionDirection}, dir: ${order.direction}, task: ${
        order.task
      }, order price: ${order.price}, average: ${order.average}, date: ${
        order.exLastTrade
      }`
    );
    // Если ордер на открытие позиции
    if (order.positionDirection === ORDER_POS_DIR_ENTRY) {
      // Сохраянем ордер в списке ордеров на открытие позиции
      this._entryOrders[order.orderId] = order;
      // Изменяем статус открытия позиции
      this._entry.status = order.status || this._entry.status;
      this._entry.price = order.average || this._entry.price;
      this._entry.date = order.exLastTrade || this._entry.date;
      this._entry.executed = order.executed || this._entry.executed;
      this._entry.remaining = order.remaining || this._entry.remaining;
    } else {
      // Если ордер на закрытие позиции

      // Сохраянем ордер в списке ордеров на закрытие позиции
      this._exitOrders[order.orderId] = order;
      // Изменяем статус закрытия позиции
      this._exit.status = order.status || this._exit.status;
      if (
        this._exit.status === ORDER_STATUS_CLOSED &&
        order.orderType === ORDER_TYPE_MARKET_FORCE
      )
        this._exit.status = POS_STATUS_CLOSED_AUTO;

      this._exit.price = order.average || this._exit.price;
      this._exit.date = order.exLastTrade || this._exit.date;
      this._exit.executed = order.executed || this._exit.executed;
      this._exit.remaining = order.remaining || this._exit.remaining;
    }
    // Устанавливаем статус позиции
    this.setStatus();
  }

  /**
   * Запрос всего текущего состояния
   *
   * @memberof Position
   */
  get state() {
    return {
      id: this._id,
      code: this._code,
      status: this._status,
      direction: this._direction,
      entry: this._entry,
      exit: this._exit,
      entryOrders: this._entryOrders,
      exitOrders: this._exitOrders
    };
  }
}

export default Position;

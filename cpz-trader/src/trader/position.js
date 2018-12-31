import { v4 as uuid } from "uuid";
import VError from "verror";
import dayjs from "cpzDayjs";
import { TRADER_SERVICE } from "cpzServices";
import {
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_SHORT,
  POS_STATUS_NEW,
  POS_STATUS_OPEN,
  POS_STATUS_CLOSED,
  POS_STATUS_CANCELED,
  POS_STATUS_ERROR,
  ORDER_STATUS_NEW,
  ORDER_STATUS_OPEN,
  ORDER_STATUS_CLOSED,
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
  ORDER_POS_DIR_ENTRY,
  ORDER_POS_DIR_EXIT,
  BACKTEST_MODE,
  createPositionSlug,
  createNewTradeSubject
} from "cpzState";
import { TRADES_ORDER_EVENT, TRADES_POSITION_EVENT } from "cpzEventTypes";
import { savePositionState } from "cpzStorage";

/**
 * Класс позиции
 *
 * @class Trader
 */
class Position {
  constructor(state) {
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
    /* Базовая валюта */
    this._asset = state.asset;
    /* Котировка валюты */
    this._currency = state.currency;
    /* Таймфрейм */
    this._timeframe = state.timeframe;
    /* Настройки */
    this._settings = state.settings;
    /* Текущий статус ["new","open","closed","canceled","error"] */
    this._status = state.status || POS_STATUS_NEW;
    this._direction = state.direction;
    this._entry = state.entry || {
      /* Текущий статус открытия ["new","open","closed","canceled","error"] */
      status: ORDER_STATUS_NEW,
      price: null,
      date: null,
      executed: null
    };

    this._exit = state.exit || {
      /* Текущий статус закрытия ["new","open","closed","canceled","error"] */
      status: ORDER_STATUS_NEW,
      price: null,
      date: null,
      executed: null
    };
    /* Ордера открытия */
    this._entryOrders = state.entryOrders || {};
    /* Ордера закрытия */
    this._exitOrders = state.exitOrders || {};
    /* Метаданные стореджа */
    this._metadata = state.metadata;
    this.log = state.log || console.log;
    this.logEvent = state.logEvent || console.log;
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

  get status() {
    return this._status;
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
      this._exit.status === ORDER_STATUS_OPEN
    ) {
      this._status = POS_STATUS_OPEN;
    } else if (
      this._entry.status === ORDER_STATUS_CLOSED &&
      this._exit.status === ORDER_STATUS_CLOSED
    ) {
      this._status = POS_STATUS_CLOSED;
    } else if (
      this._entry.status === ORDER_STATUS_CANCELED ||
      this._exit.status === ORDER_STATUS_CANCELED
    ) {
      this._status = POS_STATUS_CANCELED;
    } else if (
      this._entry.status === ORDER_STATUS_ERROR ||
      this._exit.status === ORDER_STATUS_ERROR
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
      positionId: this._positionId, // Идентификатор позиции
      orderType: signal.orderType, // Тип ордера
      price: signal.price, // Цена ордера
      volume: this._settings.volume,
      exchange: this._exchange, // Код биржи
      asset: this._asset, // Базовая валюта
      currency: this._currency, // Котировка валюты
      timeframe: this._timeframe, // Таймфрейм
      createdAt: dayjs().toJSON(), // Дата и время создания
      status: ORDER_STATUS_NEW, // Статус ордера
      direction:
        signal.action === TRADE_ACTION_CLOSE_SHORT ||
        signal.action === TRADE_ACTION_LONG
          ? ORDER_DIRECTION_BUY
          : ORDER_DIRECTION_SELL, // Направление торговли ордера
      positionDirection, // Место ордера в позиции
      action: signal.action, // Торговое действие
      task:
        signal.orderType === ORDER_TYPE_MARKET ? ORDER_TASK_OPENBYMARKET : null // Задача ордера
    };
  }

  /**
   * Создать ордер на вход в позицию
   *
   * @param {*} signal
   *
   * @memberof Position
   */
  createEntryOrder(signal) {
    this.log("createEntryOrder()");
    // Создаем ордер на открытие позиции
    this._createOrder(signal, ORDER_POS_DIR_ENTRY);
    // Сохраняем созданный ордер в списке ордеров на открытие позиции
    this._entryOrders[this._currentOrder.orderId] = this._currentOrder;
    // Изменяем статус открытия позиции
    this._entry.status = this._currentOrder.status;
    this._entry.price = this._currentOrder.price;
    this._entry.date = this._currentOrder.createdAt;
    this._entry.executed = this._currentOrder.executed;
    // Устанавливаем статус позиции
    this.setStatus();
  }

  /**
   * Создать ордер на выход из позиции
   *
   * @param {*} signal
   *
   * @memberof Position
   */
  createExitOrder(signal) {
    this.log("createExitOrder()");
    // Создаем ордер на закрытие позиции
    this._createOrder(signal, ORDER_POS_DIR_EXIT);
    // Сохраняем созданный ордер в списке ордеров на закрытие позиции
    this._exitOrders[this._currentOrder.orderId] = this._currentOrder;
    // Изменяем статус закрытия позиции
    this._exit.status = this._currentOrder.status;
    this._exit.price = this._currentOrder.price;
    this._exit.date = this._currentOrder.createdAt;
    this._exit.executed = this._currentOrder.executed;
    // Устанавливаем статус позиции
    this.setStatus();
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
    this.log("_checkOrder()");
    // Ордер ожидает обработки
    if (order.status === ORDER_STATUS_NEW) {
      // Тип ордера - лимитный
      if (order.orderType === ORDER_TYPE_LIMIT) {
        // Если покупаем
        if (order.direction === ORDER_DIRECTION_BUY) {
          // Если проскальзывание текущей цены меньше или равно заданного
          if (price - order.price <= this._settings.slippageStep) {
            // Нужно выставить лимитный ордер
            return {
              ...order,
              price: order.price + this._settings.slippageStep,
              task: ORDER_TASK_SETLIMIT
            };
          }
        }
        // Если продаем
        if (order.direction === ORDER_DIRECTION_SELL) {
          // Если проскальзывание текущей цены меньше или равно заданного
          if (order.price - price <= this._settings.slippageStep) {
            // Нужно выставить лимитный ордер
            return {
              ...order,
              price: order.price - this._settings.slippageStep,
              task: ORDER_TASK_SETLIMIT
            };
          }
        }
        // Тип ордера - стоп
      } else if (order.orderType === ORDER_TYPE_STOP) {
        // Если покупаем
        if (order.direction === ORDER_DIRECTION_BUY) {
          // Цена сигнала с учетом отклонения
          const signalPrice = order.price - this._settings.deviation;
          // Цена ордера с учетом проскальзывания
          const entryPrice = signalPrice + this._settings.slippageStep;
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
          const signalPrice = order.price + this._settings.deviation;
          // Цена ордера с учетом проскальзывания
          const entryPrice = signalPrice - this._settings.slippageStep;
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
    } else if (order.status === ORDER_STATUS_OPEN) {
      // Если покупаем и текущая цена ниже цены сигнала
      // Если продаем и текущая цена выше цены сигнала
      if (
        (order.direction === ORDER_DIRECTION_BUY && price <= order.price) ||
        (order.durection === ORDER_DIRECTION_SELL && price >= order.price)
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
    this.log("getRequiredOrders()");
    const requiredOrders = [];
    // Если ордера на открытие позиции ожидают обработки
    if (
      this._entry.status === ORDER_STATUS_NEW ||
      this._entry.status === ORDER_STATUS_OPEN
    ) {
      // Проверяем все ордера на открытие позиции ожидающие обработки
      Object.keys(this._entryOrders).forEach(key => {
        const order = this._entryOrders[key];
        const checkedOrder = this._checkOrder(order, price);
        if (checkedOrder) requiredOrders.push(checkedOrder);
      });
    }
    // Если ордера на закрытие позиции ожидают обработки
    if (
      this._exit.status === ORDER_STATUS_NEW ||
      this._entry.status === ORDER_STATUS_OPEN
    ) {
      // Проверяем все ордера на закрытие позиции ожидающие обработки
      Object.keys(this._exitOrders).forEach(key => {
        const order = this._exitOrders[key];
        const checkedOrder = this._checkOrder(order, price);
        if (checkedOrder) requiredOrders.push(checkedOrder);
      });
    }
    // Возвращаем массив ордеров для дальнейшей обработки
    return requiredOrders;
  }

  _checkOpenOrder(order) {
    this.log("_checkOpenOrder()");
    // Ордер ожидает обработки
    if (order.status === ORDER_STATUS_OPEN) {
      // Нужно проверить ордер на бирже
      return { ...order, task: ORDER_TASK_CHECKLIMIT };
    }
    // Не нужно ничего делать
    return null;
  }

  getOpenOrders() {
    this.log("getOpenOrders()");
    const openOrders = [];
    // Если ордера на открытие позиции ожидают обработки
    if (this._entry.status === ORDER_STATUS_OPEN) {
      // Проверяем все ордера на открытие позиции ожидающие обработки
      Object.keys(this._entryOrders).forEach(key => {
        const order = this._entryOrders[key];
        const checkedOrder = this._checkOpenOrder(order);
        if (checkedOrder) openOrders.push(checkedOrder);
      });
    }
    // Если ордера на закрытие позиции ожидают обработки
    if (this._entry.status === ORDER_STATUS_OPEN) {
      // Проверяем все ордера на закрытие позиции ожидающие обработки
      Object.keys(this._exitOrders).forEach(key => {
        const order = this._exitOrders[key];
        const checkedOrder = this._checkOpenOrder(order);
        if (checkedOrder) openOrders.push(checkedOrder);
      });
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
    this.log("handleOrder()");
    // Если ордер на открытие позиции
    if (order.positionDirection === ORDER_POS_DIR_ENTRY) {
      // Сохраянем ордер в списке ордеров на открытие позиции
      this._entryOrders[order.orderId] = order;
      // Изменяем статус открытия позиции
      this._entry.status = order.status;
      this._entry.price = order.price;
      this._entry.date = order.createdAt;
      this._entry.executed = order.executed;
    } else {
      // Если ордер на закрытие позиции

      // Сохраянем ордер в списке ордеров на закрытие позиции
      this._exitOrders[order.orderId] = order;
      // Изменяем статус закрытия позиции
      this._exit.status = order.status;
      this._exit.price = order.price;
      this._exit.date = order.createdAt;
      this._exit.executed = order.executed;
    }
    // Устанавливаем статус позиции
    this.setStatus();
    // Создаем новое осбытие
    return this._createOrderEvent(order);
  }

  /**
   * Создать событие Ордер
   *
   * @param {*} order
   */
  _createOrderEvent(order) {
    return {
      id: uuid(),
      dataVersion: "1.0",
      eventTime: new Date(),
      subject: createNewTradeSubject({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        robotId: this._robotId,
        userId: this._userId
      }),
      eventType: TRADES_ORDER_EVENT.eventType,
      data: {
        ...order,
        positionId: this._positionId,
        traderId: this._traderId,
        mode: this._settings.mode,
        robotId: this._robotId,
        userId: this._userId,
        adviserId: this._adviserId,
        service: TRADER_SERVICE
      }
    };
  }

  createPositionEvent() {
    return {
      id: uuid(),
      dataVersion: "1.0",
      eventTime: new Date(),
      subject: createNewTradeSubject({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        robotId: this._robotId,
        userId: this._userId
      }),
      eventType: TRADES_POSITION_EVENT.eventType,
      data: {
        positionId: this._positionId,
        traderId: this._traderId,
        mode: this._settings.mode,
        robotId: this._robotId,
        userId: this._userId,
        adviserId: this._adviserId,
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        status: this._status,
        direction: this._direction,
        settings: this._settings,
        entry: this._entry,
        exit: this._exit
      }
    };
  }

  /**
   * Запрос всего текущего состояния
   *
   * @memberof Position
   */
  getCurrentState() {
    return {
      PartitionKey: createPositionSlug({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency
      }),
      RowKey: this._positionId,
      mode: this._settings.mode,
      positionId: this._positionId,
      traderId: this._traderId,
      robotId: this._robotId,
      userId: this._userId,
      adviserId: this._adviserId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      settings: this._settings,
      status: this._status,
      direction: this._direction,
      entry: this._entry,
      exit: this._exit,
      entryOrders: this._entryOrders,
      exitOrders: this._exitOrders
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
      if (this._settings.mode !== BACKTEST_MODE)
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

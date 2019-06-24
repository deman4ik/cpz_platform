import { v4 as uuid } from "uuid";
import {
  TRADE_ACTION_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_SHORT,
  TRADE_ACTION_CLOSE_LONG,
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
  ORDER_TYPE_STOP,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_MARKET_FORCE,
  ORDER_TASK_OPEN_MARKET,
  ORDER_TASK_OPEN_LIMIT,
  ORDER_TASK_CHECK,
  ORDER_TASK_CANCEL,
  ORDER_DIRECTION_BUY,
  ORDER_DIRECTION_SELL,
  ORDER_POS_DIR_ENTRY,
  ORDER_POS_DIR_EXIT,
  BACKTEST_MODE
} from "cpz/config/state";
import dayjs from "cpz/utils/dayjs";

/**
 * Класс позиции
 *
 * @class Trader
 */
class Position {
  constructor(state) {
    /* Уникальный идентификатор позиции */
    this._id = state.id;
    this._prefix = state.prefix;
    this._code = state.code;
    this._direction = state.direction;
    /* Текущий статус ["new","open","closed","closedAuto","canceled","error"] */
    this._status = state.status || POS_STATUS_NEW;
    this._closeRequested = state.closeRequested || false;
    this._reason = state.reason;
    this._entry = state.entry || {
      /* Текущий статус открытия ["new","open","closed","canceled","error"] */
      status: null,
      orderType: null,
      price: null,
      date: null,
      signalPrice: null,
      signalDate: null,
      executed: null,
      remaining: null,
      slippageRetriesCount: 1
    };

    this._exit = state.exit || {
      /* Текущий статус закрытия ["new","open","closed","canceled","error"] */
      status: null,
      orderType: null,
      price: null,
      date: null,
      signalPrice: null,
      signalDate: null,
      executed: null,
      remaining: null,
      slippageRetriesCount: 1
    };
    /* Ордера открытия */
    this._entryOrders = state.entryOrders || {};
    /* Ордера закрытия */
    this._exitOrders = state.exitOrders || {};
    this._executed = state.executed;
    this._settings = state.settings;
    this.logDebug = state.logDebug;
  }

  log(...args) {
    this.logDebug(`pos ${this._code}`, ...args);
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

  set reason(reason) {
    this._reason = reason;
  }

  get closeRequested() {
    return this._closeRequested;
  }

  set closeRequested(closeRequested) {
    this._closeRequested = closeRequested;
  }

  get entryStatus() {
    return this._entry.status;
  }

  get exitStatus() {
    return this._exit.status;
  }

  get entryOrders() {
    return Object.values(this._entryOrders);
  }

  get exitOrders() {
    return Object.values(this._exitOrders);
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
      this._exit.status === ORDER_STATUS_OPEN ||
      this._exit.status === ORDER_STATUS_CANCELED
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
   *
   * @memberof Position
   */
  _createOrder(signal, positionDirection) {
    this.log("Creating new order...", signal);
    const { signalId, orderType, price, action } = signal;
    const volume =
      (positionDirection === ORDER_POS_DIR_EXIT && this._entry.executed) ||
      (signal.settings && signal.settings.volume) ||
      this._settings.volume;
    const slippageRetriesCount =
      positionDirection === ORDER_POS_DIR_ENTRY
        ? this._entry.slippageRetriesCount
        : this._exit.slippageRetriesCount;
    this._currentOrder = {
      orderId: uuid(), // Уникальный идентификатор ордера
      signalId, // Идентификатор сигнала
      positionId: this._id, // Идентификатор позиции
      orderType, // Тип ордера
      signalPrice: price,
      average: price,
      price, // Цена ордера
      volume,
      executed: 0,
      remaining: volume,
      createdAt: dayjs.utc().toISOString(), // Дата и время создания
      lastCheck: dayjs.utc().toISOString(),
      status: ORDER_STATUS_NEW, // Статус ордера
      direction:
        action === TRADE_ACTION_LONG || action === TRADE_ACTION_CLOSE_SHORT
          ? ORDER_DIRECTION_BUY
          : ORDER_DIRECTION_SELL, // Направление торговли ордера
      positionDirection, // Место ордера в позиции
      action, // Торговое действие
      params: {
        defaultLeverage: this._settings.defaultLeverage
      },
      slippageRetriesCount,
      slippageStep: this._settings.slippageStep * slippageRetriesCount,
      task:
        orderType === ORDER_TYPE_MARKET || orderType === ORDER_TYPE_MARKET_FORCE
          ? ORDER_TASK_OPEN_MARKET
          : null, // Задача ордера
      error: null // Ошибка выполнения ордера
    };
  }

  /**
   * Создать ордер на вход в позицию
   *
   * @param {object} signal
   *
   * @memberof Position
   */
  createEntryOrder(signal) {
    // Создаем ордер на открытие позиции
    this._createOrder(signal, ORDER_POS_DIR_ENTRY);
    // Сохраняем созданный ордер в списке ордеров на открытие позиции
    this._entryOrders[this._currentOrder.orderId] = this._currentOrder;
    // Изменяем статус открытия позиции
    this._entry.status = this._currentOrder.status;
    this._entry.orderType = this._entry.orderType || signal.orderType;
    const averagePrice = this.entryOrders
      .filter(({ average }) => !!average)
      .reduce((pre, { average }, _, { length }) => pre + average / length, 0);
    this._entry.price =
      (averagePrice > 0 && averagePrice) ||
      this._entry.price ||
      this._currentOrder.price;
    this._entry.date = null;
    this._entry.signalPrice = this._entry.signalPrice || signal.price;
    this._entry.signalDate = this._entry.signalDate || signal.timestamp;
    this._entry.executed = this.entryOrders
      .filter(({ executed }) => !!executed)
      .reduce((pre, { executed }) => pre + executed, 0);
    this._entry.remaining = this.entryOrders
      .filter(({ remaining }) => !!remaining)
      .reduce((pre, { remaining }) => pre + remaining, 0);
    // Устанавливаем статус позиции
    this.setStatus();
  }

  /**
   * Создать ордер на выход из позиции
   *
   * @param {object} signal
   *
   * @memberof Position
   */
  createExitOrder(signal) {
    // Создаем ордер на закрытие позиции
    this._createOrder(signal, ORDER_POS_DIR_EXIT);
    // Сохраняем созданный ордер в списке ордеров на закрытие позиции
    this._exitOrders[this._currentOrder.orderId] = this._currentOrder;
    // Изменяем статус закрытия позиции
    this._exit.status = this._currentOrder.status;
    this._exit.orderType = this._exit.orderType || signal.orderType;
    const averagePrice = this.exitOrders
      .filter(({ average }) => !!average)
      .reduce((pre, { average }, _, { length }) => pre + average / length, 0);
    this._exit.price =
      (averagePrice > 0 && averagePrice) ||
      this._entry.price ||
      this._currentOrder.price;
    this._exit.date = null;
    this._exit.signalPrice = this._exit.signalPrice || signal.price;
    this._exit.signalDate = this._exit.signalDate || signal.timestamp;
    this._exit.executed = this.exitOrders
      .filter(({ executed }) => !!executed)
      .reduce((pre, { executed }) => pre + executed, 0);
    this._exit.remaining = this.exitOrders
      .filter(({ remaining }) => !!remaining)
      .reduce((pre, { remaining }) => pre + remaining, 0);
    // Устанавливаем статус позиции
    this.setStatus();
  }

  _createOpenOrder({ volume, orderType }) {
    this.createEntryOrder({
      signalId: uuid(),
      price: this._entry.signalPrice,
      timestamp: dayjs.utc().toISOString(),
      orderType,
      positionId: this._id,
      action:
        this._direction === ORDER_DIRECTION_BUY
          ? TRADE_ACTION_LONG
          : TRADE_ACTION_SHORT,
      settings: {
        volume
      }
    });
  }

  _createCloseOrder({ volume, orderType }) {
    this.createExitOrder({
      signalId: uuid(),
      price: this._exit.signalPrice,
      timestamp: dayjs.utc().toISOString(),
      orderType,
      positionId: this._id,
      action:
        this._direction === ORDER_DIRECTION_BUY
          ? TRADE_ACTION_CLOSE_LONG
          : TRADE_ACTION_CLOSE_SHORT,
      settings: {
        volume
      }
    });
  }

  /**
   * Выборка всех ордеров необходимых для закрытия позиции
   *
   * @returns {[Object]}
   * @memberof Position
   */
  getOrdersToClosePosition() {
    // Необходимые ордера для закрытия позиции
    let requiredOrders = [];

    if (this._entry.status === ORDER_STATUS_NEW) {
      this.log("entry new");
      // Если ордер на открытие не выставлен на биржу
      // помечаем что позиция отменена
      this._entry.status = ORDER_STATUS_CANCELED;
      Object.keys(this._entryOrders).forEach(key => {
        if (this._entryOrders[key].status === ORDER_STATUS_NEW)
          this._entryOrders[key].status = ORDER_STATUS_CANCELED;
      });
      this.setStatus();
    } else if (this._entry.status === ORDER_STATUS_OPEN) {
      this.log("entry open");
      // Если ордер на открытие не выставл
      // Если ордер на открытие выставлен на биржу
      // Если ордер на открытие еще не исполнен
      if (!this._entry.executed || this._entry.executed === 0) {
        this.log("entry not executed");
        // Отменяем ордера на открытие
        requiredOrders = Object.values(this._entryOrders)
          .filter(order => order.status === ORDER_STATUS_OPEN)
          .map(order => ({ ...order, task: ORDER_TASK_CANCEL }));
      } else {
        this.log("entry executed", this._entry.executed);
        // Если ордер на открытие частично исполнен
        // Создаем новый ордер на принудительное закрытие позиции
        this._createCloseOrder({
          volume: this._entry.executed,
          orderType: ORDER_TYPE_MARKET_FORCE
        });

        requiredOrders = Object.values(this._exitOrders).filter(
          order => order.task
        );
      }
      // Если ордер на открытие позиции отменен
    } else if (this._entry.status === ORDER_STATUS_CANCELED) {
      this.log("entry canceled");
      // Если ордер на открытие еще не исполнен
      if (!this._entry.executed || this._entry.executed === 0) {
        this.log("entry not executed");
        this._status = POS_STATUS_CANCELED;
        // Больше ничего не надо делать, выходим
        return requiredOrders;
      }
      this.log("entry executed", this._entry.executed);
      // Если ордер на открытие частично исполнен
      // Создаем новый ордер на принудительное закрытие позиции
      this._createCloseOrder({
        volume: this._entry.executed,
        orderType: ORDER_TYPE_MARKET_FORCE
      });

      requiredOrders = Object.values(this._exitOrders).filter(
        order => order.task
      );
    } else if (
      this._entry.status === ORDER_STATUS_CLOSED &&
      (!this._exit.status || this._exit.status === ORDER_STATUS_NEW)
    ) {
      this.log("entry closed - exit none/new");
      // Если ордер на открытие позиции исполнен и
      // ордер на закрытие позиции не выставлен на биржу
      // или есть созданные ордера на закрытие помечаем их как отмененные
      Object.keys(this._exitOrders).forEach(key => {
        if (this._exitOrders[key].status === ORDER_STATUS_NEW)
          this._exitOrders[key].status = ORDER_STATUS_CANCELED;
      });
      // Создаем новый ордер на принудительное закрытие позиции
      this._createCloseOrder({
        volume: this._entry.executed,
        orderType: ORDER_TYPE_MARKET_FORCE
      });
      requiredOrders = Object.values(this._exitOrders).filter(
        order => order.task
      );
    } else if (this._exit.status === ORDER_STATUS_OPEN) {
      this.log("exit open");
      // Если ордер на закрытие позиции выставлен на биржу
      // Отменяем выставленные ордера на закрытие
      // при условии что это не принудительный ордер на закрытие
      requiredOrders = Object.values(this._exitOrders)
        .filter(
          order =>
            order.status === ORDER_STATUS_OPEN &&
            order.type !== ORDER_TYPE_MARKET_FORCE
        )
        .map(order => ({ ...order, task: ORDER_TASK_CANCEL }));
      return requiredOrders;
    } else if (this._exit.status === ORDER_STATUS_CANCELED) {
      this.log("exit canceled");
      // Если ордер на закрытие позиции отменен
      // По умолчанию объем закрытия = объему открытия позиции
      let volume = this._entry.executed;
      // Если уже какой-то объем на закрытие исполнился
      if (this._exit.executed && this._exit.executed > 0)
        // Вычитаем этот объем из объема открытия
        volume -= this._exit.executed;
      // Если все еще нужно что-то закрывать
      if (volume > 0) {
        // Создаем новый ордер на принудительное закрытие позиции
        this._createCloseOrder({
          volume,
          orderType: ORDER_TYPE_MARKET_FORCE
        });
        requiredOrders = Object.values(this._exitOrders).filter(
          order => order.task
        );
      }
    }
    // Возвращаем массив необходимых ордеров (или пустой массив)
    return requiredOrders;
  }

  /**
   * Проверить ордер по текущей цене
   *
   * @param {object} order
   * @param {number} price
   * @param {boolean} checkPrice if false disable price check
   *
   * @memberof Position
   */
  _checkOrder(order, price, checkPrice = true) {
    this.log(
      `checkOrder ${order.orderId}, status: ${order.status}, posDir: ${order.positionDirection}, dir: ${order.direction}, task: ${order.task}, order price: ${order.price}, current price: ${price}`
    );
    // Ордер ожидает обработки
    if (order.status === ORDER_STATUS_NEW) {
      // Тип ордера - лимитный или стоп
      if (
        order.orderType === ORDER_TYPE_LIMIT ||
        order.orderType === ORDER_TYPE_STOP
      ) {
        if (
          !checkPrice ||
          (order.direction === ORDER_DIRECTION_BUY &&
            checkPrice &&
            price <= order.price) ||
          (order.direction === ORDER_DIRECTION_SELL &&
            checkPrice &&
            price >= order.price)
        ) {
          return {
            ...order,
            task: ORDER_TASK_OPEN_LIMIT
          };
        }
      } else if (
        // Тип ордера маркет (выставляется как лимит)
        order.orderType === ORDER_TYPE_MARKET
      ) {
        if (
          !checkPrice ||
          (order.direction === ORDER_DIRECTION_BUY &&
            checkPrice &&
            price <= order.price) ||
          (order.direction === ORDER_DIRECTION_SELL &&
            checkPrice &&
            price >= order.price)
        ) {
          return {
            ...order,
            task: ORDER_TASK_OPEN_MARKET
          };
        }
      } else if (
        // Тип ордера принудительный маркет
        order.orderType === ORDER_TYPE_MARKET_FORCE
      ) {
        return {
          ...order,
          task: ORDER_TASK_OPEN_MARKET
        };
      }
      // Ордер уже выставлен
    } else if (order.status === ORDER_STATUS_OPEN) {
      // Если покупаем и текущая цена ниже цены сигнала
      // ИЛИ
      // Если продаем и текущая цена выше цены сигнала
      // ИЛИ
      // Если последний раз проверяли больше чем 30 секунд назад
      if (
        (order.direction === ORDER_DIRECTION_BUY &&
          (!checkPrice || (checkPrice && price <= order.price))) ||
        (order.direction === ORDER_DIRECTION_SELL &&
          (!checkPrice || (checkPrice && price >= order.price))) ||
        dayjs.utc().diff(dayjs.utc(order.lastCheck), "second") > 30
      ) {
        // Нужно проверить ордер на бирже
        this.log(ORDER_TASK_CHECK);
        return { ...order, task: ORDER_TASK_CHECK };
      }
      // Если не в режиме бэктеста
      // проверяли недавно и таймаут открытого ордера истек
      if (
        this._settings.mode !== BACKTEST_MODE &&
        dayjs.utc().diff(dayjs.utc(order.lastCheck), "second") <= 30 &&
        order.exTimestamp &&
        dayjs.utc().diff(dayjs.utc(order.exTimestamp), "minute") >
          this._settings.openOrderTimeout
      ) {
        // Отменяем ордер
        this.log(ORDER_TASK_CANCEL);
        if (order.positionDirection === ORDER_POS_DIR_ENTRY) {
          this._entry.slippageRetriesCount += 1;
        } else {
          this._exit.slippageRetriesCount += 1;
        }
        this._reason = `${order.positionDirection}_timeout`;
        return { ...order, task: ORDER_TASK_CANCEL };
      }
    }
    // Не нужно ничего делать
    return null;
  }

  /**
   * Выборка всех ордеров необходимых для обработки
   *
   * @param {number} price
   * @param {boolean} checkPrice if false disable price check
   * @memberof Position
   */
  getOrdersToExecuteByPrice(price, checkPrice = true) {
    this.log(
      `getOrdersToExecuteByPrice entry: ${this._entry.status}, exit: ${this._exit.status}, price: ${price}`
    );
    let requiredOrders = [];

    if (
      this._entry.status === ORDER_STATUS_NEW ||
      this._entry.status === ORDER_STATUS_OPEN
    ) {
      this.log("entry new/open");
      // Если ордера на открытие позиции ожидают обработки
      // Проверяем все ордера на открытие позиции ожидающие обработки
      requiredOrders = Object.values(this._entryOrders)
        .map(order => this._checkOrder(order, price, checkPrice))
        .filter(order => !!order);
    } else if (
      this._entry.status === ORDER_STATUS_CLOSED &&
      (this._exit.status === ORDER_STATUS_NEW ||
        this._exit.status === ORDER_STATUS_OPEN)
    ) {
      this.log("entry closed - exit new/open");
      // Если ордер на закрытие позиции еще не выставлен
      // Не в режиме бэктеста
      // И прошло заданное время после сигнала на закрытие
      if (
        this._exit.status === ORDER_STATUS_NEW &&
        this._settings.mode !== BACKTEST_MODE &&
        this._exit.signalDate &&
        dayjs.utc().diff(dayjs.utc(this._exit.signalDate), "minute") >
          this._settings.exitPositionTimeout
      ) {
        // Закрываем позицию
        requiredOrders = this.getOrdersToClosePosition();
      } else {
        // Если ордера на открытие позиции исполнены и ордера на закрытие позиции ожидают обработки
        // Проверяем все ордера на закрытие позиции ожидающие обработки
        requiredOrders = Object.values(this._exitOrders)
          .map(order => this._checkOrder(order, price, checkPrice))
          .filter(order => !!order);
      }
    } else if (this._entry.status === ORDER_STATUS_CANCELED) {
      // Если ордер на открытие позиции отменен
      // Если уже какой-то объем на открытие исполнился
      const volume = this._entry.remaining;

      if (
        this._entry.executed &&
        this._entry.executed === 0 &&
        this._entry.orderType === ORDER_TYPE_MARKET_FORCE
      ) {
        this._status = POS_STATUS_CANCELED;
        return;
      }
      if (
        this._entry.slippageRetriesCount <=
          this._settings.slippageRetriesCount &&
        !this.closeRequested
      ) {
        this._createOpenOrder({
          volume,
          orderType: this._entry.orderType
        });
      } else if (
        this._entry.slippageRetriesCount >
          this._settings.slippageRetriesCount ||
        this.closeRequested
      ) {
        this._createOpenOrder({
          volume,
          orderType: ORDER_TYPE_MARKET_FORCE
        });
      }

      requiredOrders = this.entryOrders.filter(order => order.task);
    } else if (this._exit.status === ORDER_STATUS_CANCELED) {
      // Если ордер на закрытие позиции отменен
      // По умолчанию объем закрытия = объему открытия позиции
      let volume = this._entry.executed;
      // Если уже какой-то объем на закрытие исполнился
      if (this._exit.executed && this._exit.executed > 0)
        // Вычитаем этот объем из объема открытия
        volume -= this._exit.executed;
      // Если все еще нужно что-то закрывать
      if (volume > 0) {
        if (
          this._exit.slippageRetriesCount <=
            this._settings.slippageRetriesCount &&
          !this.closeRequested
        ) {
          this._createCloseOrder({
            volume,
            orderType: this._exit.orderType
          });
        } else if (
          this._exit.slippageRetriesCount >
            this._settings.slippageRetriesCount ||
          this.closeRequested
        ) {
          this._createCloseOrder({
            volume,
            orderType: ORDER_TYPE_MARKET_FORCE
          });
        }
        requiredOrders = this.exitOrders.filter(order => order.task);
      }
    }
    if (requiredOrders.length > 0) {
      this.log(
        `${requiredOrders.length} order required position ${this._code}, price: ${price}`
      );
    }
    // Возвращаем массив ордеров для дальнейшей обработки
    return requiredOrders;
  }

  /**
   * Выборка ордеров для дальнейшей обработки на бирже
   *
   * @returns
   * @memberof Position
   */
  getOrdersToExecute() {
    let requiredOrders = [];

    if (this._entry.status === ORDER_STATUS_OPEN) {
      // Если ордера на открытие позиции ожидают обработки
      // Проверяем все ордера на открытие позиции ожидающие обработки
      requiredOrders = Object.values(this._entryOrders)
        .filter(order => order.status === ORDER_STATUS_OPEN)
        .map(order => ({ ...order, task: ORDER_TASK_CHECK }));
    } else if (this._exit.status === ORDER_STATUS_OPEN) {
      // Если ордера на закрытие позиции ожидают обработки
      // Проверяем все ордера на закрытие позиции ожидающие обработки
      requiredOrders = Object.values(this._exitOrders)
        .filter(order => order.status === ORDER_STATUS_OPEN)
        .map(order => ({ ...order, task: ORDER_TASK_CHECK }));
    } else if (this._entry.status === ORDER_STATUS_CANCELED) {
      // Если ордер на открытие позиции отменен
      // Если уже какой-то объем на открытие исполнился
      const volume = this._entry.remaining;

      if (
        this._entry.slippageRetriesCount <=
          this._settings.slippageRetriesCount &&
        !this.closeRequested
      ) {
        this._createOpenOrder({
          volume,
          orderType: this._entry.orderType
        });
      } else if (
        this._entry.slippageRetriesCount >
          this._settings.slippageRetriesCount ||
        this.closeRequested
      ) {
        this._createOpenOrder({
          volume,
          orderType: ORDER_TYPE_MARKET_FORCE
        });
      }

      requiredOrders = this.entryOrders.filter(order => order.task);
    } else if (this._exit.status === ORDER_STATUS_CANCELED) {
      // Если ордер на закрытие позиции отменен
      // По умолчанию объем закрытия = объему открытия позиции
      let volume = this._entry.executed;
      // Если уже какой-то объем на закрытие исполнился
      if (this._exit.executed && this._exit.executed > 0)
        // Вычитаем этот объем из объема открытия
        volume -= this._exit.executed;
      // Если все еще нужно что-то закрывать
      if (volume > 0) {
        if (
          this._exit.slippageRetriesCount <=
            this._settings.slippageRetriesCount &&
          !this.closeRequested
        ) {
          this._createCloseOrder({
            volume,
            orderType: this._exit.orderType
          });
        } else if (
          this._exit.slippageRetriesCount >
            this._settings.slippageRetriesCount ||
          this.closeRequested
        ) {
          this._createCloseOrder({
            volume,
            orderType: ORDER_TYPE_MARKET_FORCE
          });
        }
        requiredOrders = this.exitOrders.filter(order => order.task);
      }
    }
    // Возвращаем массив ордеров для дальнейшей обработки
    return requiredOrders;
  }

  /**
   * Сохранение текущего состояния ордера
   *
   * @param {*} order
   *
   * @memberof Position
   */
  handleOrder(order) {
    this.log(
      `Executed ${order.orderId}, status: ${order.status}, posDir: ${order.positionDirection}, dir: ${order.direction}, task: ${order.task}, order price: ${order.price}, average: ${order.average}, date: ${order.exLastTrade}`
    );
    // Если ордер на открытие позиции
    if (order.positionDirection === ORDER_POS_DIR_ENTRY) {
      // Сохраянем ордер в списке ордеров на открытие позиции
      this._entryOrders[order.orderId] = order;
      // Изменяем статус открытия позиции
      this._entry.status = order.status || this._entry.status;
      this._entry.orderType = order.orderType;
      const averagePrice = this.entryOrders
        .filter(({ average }) => !!average)
        .reduce((pre, { average }, _, { length }) => pre + average / length, 0);
      this._entry.price =
        (averagePrice > 0 && averagePrice) || this._entry.price;
      this._entry.date = order.exLastTrade;
      this._entry.executed = this.entryOrders
        .filter(({ executed }) => !!executed)
        .reduce((pre, { executed }) => pre + executed, 0);
      this._entry.remaining = this.entryOrders
        .filter(({ remaining }) => !!remaining)
        .reduce((pre, { remaining }) => pre + remaining, 0);
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
      this._exit.orderType = order.orderType;
      const averagePrice = this.exitOrders
        .filter(({ average }) => !!average)
        .reduce((pre, { average }, _, { length }) => pre + average / length, 0);
      this._exit.price = (averagePrice > 0 && averagePrice) || this._exit.price;
      this._exit.date = order.exLastTrade;
      this._exit.executed = this.exitOrders
        .filter(({ executed }) => !!executed)
        .reduce((pre, { executed }) => pre + executed, 0);
      this._exit.remaining = this.exitOrders
        .filter(({ remaining }) => !!remaining)
        .reduce((pre, { remaining }) => pre + remaining, 0);
    }
    // Устанавливаем статус позиции
    this.setStatus();
    this._executed = this._exit.executed || this._entry.executed;
  }

  /**
   * Запрос всего текущего состояния
   *
   * @memberof Position
   */
  get state() {
    return {
      id: this._id,
      prefix: this._prefix,
      code: this._code,
      status: this._status,
      closeRequested: this._closeRequested,
      direction: this._direction,
      entry: this._entry,
      exit: this._exit,
      entryOrders: this._entryOrders,
      exitOrders: this._exitOrders,
      reason: this._reason,
      executed: this._executed
    };
  }

  get props() {
    return {
      id: this._id,
      prefix: this._prefix,
      code: this._code,
      status: this._status,
      closeRequested: this._closeRequested,
      direction: this._direction,
      entry: this._entry,
      exit: this._exit,
      reason: this._reason,
      executed: this._executed
    };
  }
}

export default Position;

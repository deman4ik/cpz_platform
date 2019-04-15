import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import {
  TRADE_ACTION_LONG,
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
    this._closeRequested = state.closeRequested || false;
    this._reason = state.reason;
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
    this._executed = state.executed;
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
    if (this._entry.status === ORDER_STATUS_CANCELED) {
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
    Log.debug("Creating new order...", signal);
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
      lastCheck: dayjs.utc().toISOString(),
      status: ORDER_STATUS_NEW, // Статус ордера
      direction:
        action === TRADE_ACTION_LONG || action === TRADE_ACTION_CLOSE_SHORT
          ? ORDER_DIRECTION_BUY
          : ORDER_DIRECTION_SELL, // Направление торговли ордера
      positionDirection, // Место ордера в позиции
      action, // Торговое действие
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
    this._entry.date = null;
    this._entry.executed = null;
    this._entry.remaining = null;
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
    this._exit.date = null;
    this._exit.executed = null;
    this._exit.remaining = null;
    // Устанавливаем статус позиции
    this.setStatus();
  }

  /**
   * Создать ордер на принудительный выход из позиции
   *
   * @param {number} volume объем выхода
   * @param {Object} settings настройки трейдера
   * @memberof Position
   */
  _createCloseOrder(volume, settings) {
    this.createExitOrder(
      {
        signalId: uuid(),
        price: null,
        timestamp: dayjs.utc().toISOString(),
        orderType: ORDER_TYPE_MARKET_FORCE,
        positionId: this._id,
        action:
          this._direction === ORDER_DIRECTION_BUY
            ? TRADE_ACTION_CLOSE_LONG
            : TRADE_ACTION_CLOSE_SHORT,
        settings: {
          volume
        }
      },
      settings
    );
  }

  /**
   * Выборка всех ордеров необходимых для закрытия позиции
   *
   * @returns {[Object]}
   * @memberof Position
   */
  getOrdersToClosePosition(settings) {
    Log.debug("position getOrdersToClosePosition");
    // Необходимые ордера для закрытия позиции
    let requiredOrders = [];

    if (this._entry.status === ORDER_STATUS_NEW) {
      Log.debug("entry new");
      // Если ордер на открытие не выставлен на биржу
      // помечаем что позиция отменена
      this._entry.status = ORDER_STATUS_CANCELED;
      Object.keys(this._entryOrders).forEach(key => {
        if (this._entryOrders[key].status === ORDER_STATUS_NEW)
          this._entryOrders[key].status = ORDER_STATUS_CANCELED;
      });
      this.setStatus();
    } else if (this._entry.status === ORDER_STATUS_OPEN) {
      Log.debug("entry open");
      // Если ордер на открытие не выставл
      // Если ордер на открытие выставлен на биржу
      // Если ордер на открытие еще не исполнен
      if (!this._entry.executed || this._entry.executed === 0) {
        Log.debug("entry not executed");
        // Отменяем ордера на открытие
        requiredOrders = Object.values(this._entryOrders)
          .filter(order => order.status === ORDER_STATUS_OPEN)
          .map(order => ({ ...order, task: ORDER_TASK_CANCEL }));
      } else {
        Log.debug("entry executed", this._entry.executed);
        // Если ордер на открытие частично исполнен
        // Создаем новый ордер на принудительное закрытие позиции
        this._createCloseOrder(this._entry.executed, settings);

        requiredOrders = Object.values(this._exitOrders).filter(
          order => order.task
        );
      }
      // Если ордер на открытие позиции отменен
    } else if (this._entry.status === ORDER_STATUS_CANCELED) {
      Log.debug("entry canceled");
      // Если ордер на открытие еще не исполнен
      if (!this._entry.executed || this._entry.executed === 0) {
        Log.debug("entry not executed");
        // Больше ничего не надо делать, выходим
        return requiredOrders;
      }
      Log.debug("entry executed", this._entry.executed);
      // Если ордер на открытие частично исполнен
      // Создаем новый ордер на принудительное закрытие позиции
      this._createCloseOrder(this._entry.executed, settings);

      requiredOrders = Object.values(this._exitOrders).filter(
        order => order.task
      );
    } else if (
      this._entry.status === ORDER_STATUS_CLOSED &&
      (!this._exit.status || this._exit.status === ORDER_STATUS_NEW)
    ) {
      Log.debug("entry closed - exit none/new");
      // Если ордер на открытие позиции исполнен и
      // ордер на закрытие позиции не выставлен на биржу
      // или есть созданные ордера на закрытие помечаем их как отмененные
      Object.keys(this._exitOrders).forEach(key => {
        if (this._exitOrders[key].status === ORDER_STATUS_NEW)
          this._exitOrders[key].status = ORDER_STATUS_CANCELED;
      });
      // Создаем новый ордер на принудительное закрытие позиции
      this._createCloseOrder(this._entry.executed, settings);
      requiredOrders = Object.values(this._exitOrders).filter(
        order => order.task
      );
    } else if (this._exit.status === ORDER_STATUS_OPEN) {
      Log.debug("exit open");
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
      Log.debug("exit canceled");
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
        this._createCloseOrder(volume, settings);
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
   * @param {object} settings Trader settings
   *
   * @memberof Position
   */
  _checkOrder(order, price, settings) {
    Log.debug(
      `position checkOrder ${order.orderId}, position: ${this._code}, status: ${
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
            Log.debug(ORDER_TASK_OPEN_LIMIT);
            return {
              ...order,
              price: order.price + settings.slippageStep,
              task: ORDER_TASK_OPEN_LIMIT
            };
          }
        }
        // Если продаем
        if (order.direction === ORDER_DIRECTION_SELL) {
          if (price >= order.price) {
            // Нужно выставить лимитный ордер
            Log.debug(ORDER_TASK_OPEN_LIMIT);
            return {
              ...order,
              price: order.price - settings.slippageStep,
              task: ORDER_TASK_OPEN_LIMIT
            };
          }
        }
      } else if (
        order.orderType === ORDER_TYPE_MARKET ||
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
      // Если последний раз проверяли больше чем минуту назад
      if (
        (order.direction === ORDER_DIRECTION_BUY && price <= order.price) ||
        (order.direction === ORDER_DIRECTION_SELL && price >= order.price) ||
        dayjs.utc().diff(dayjs.utc(order.lastCheck), "minute") > 1
      ) {
        // Нужно проверить ордер на бирже
        Log.debug(ORDER_TASK_CHECK);
        return { ...order, task: ORDER_TASK_CHECK };
      }
      // Если не в режиме бэктеста
      // проверяли недавно и таймаут открытого ордера истек
      if (
        settings.mode !== BACKTEST_MODE &&
        dayjs.utc().diff(dayjs.utc(order.lastCheck), "minute") <= 1 &&
        order.exTimestamp &&
        dayjs.utc().diff(dayjs.utc(order.exTimestamp), "minute") >
          settings.openOrderTimeout
      ) {
        // Отменяем ордер
        Log.debug(ORDER_TASK_CANCEL);
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
   * @param {object} settings Trader settings
   *
   * @memberof Position
   */
  getOrdersToExecuteByPrice(price, settings) {
    Log.debug(
      `position getOrdersToExecuteByPrice position: ${this._code}, entry: ${
        this._entry.status
      }, exit: ${this._exit.status}, price: ${price}`
    );
    let requiredOrders = [];

    if (
      this._entry.status === ORDER_STATUS_NEW ||
      this._entry.status === ORDER_STATUS_OPEN
    ) {
      Log.debug("entry new/open");
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
      Log.debug("entry closed - exit new/open");
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
   * Выборка ордеров для дальнейшей обработки на бирже
   *
   * @returns
   * @memberof Position
   */
  getOrdersToExecute(settings) {
    Log.debug("postition getOrdersToExecute");
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
        // Создаем новый ордер на принудительное закрытие позиции
        this._createCloseOrder(volume, settings);
        requiredOrders = Object.values(this._exitOrders).filter(
          order => order.task
        );
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
    Log.debug(
      `postiion Executed ${order.orderId}, position: ${this._code}, status: ${
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
      this._entry.date = order.exLastTrade;
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
      this._exit.date = order.exLastTrade;
      this._exit.executed = order.executed || this._exit.executed;
      this._exit.remaining = order.remaining || this._exit.remaining;
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
}

export default Position;

import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import VError from "verror";

import { TRADER_SERVICE } from "cpzServices";
import {
  REALTIME_MODE,
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_FINISHED,
  TRADE_ACTION_LONG,
  TRADE_ACTION_SHORT,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_POSTED,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TASK_OPENBYMARKET,
  ORDER_TASK_SETLIMIT,
  ORDER_TASK_CHECKLIMIT
} from "cpzState";
import publishEvents from "cpzEvents";
import { LOG_TRADER_EVENT, LOG_TOPIC } from "cpzEventTypes";
import { saveTraderState, getPositonByKey } from "../tableStorage";
import Position from "./position";
/**
 * Класс проторговщика
 *
 * @class Trader
 */
class Trader {
  /**
   * Конструктор
   * @param {Object} context
   * @param {Object} state
   */
  constructor(context, state) {
    /* Текущий контекст выполнения */
    this._context = context;
    /* Тема события */
    this._eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Идентификатор робота */
    this._robotId = state.robotId;
    /* Идентификатор пользователя */
    this._userId = state.userId;
    /* Идентификатор советника */
    this._adviserId = state.adviserId;
    /* Режим работы ['backtest', 'emulator', 'realtime'] */
    this._mode = state.mode;
    /* Режима дебага [true,false] */
    this._debug = state.debug || false;
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
    this._slippageStep = state.slippageStep || 0;
    /* Отклонение цены */
    this._deviation = state.deviation || 0;
    /* Объем */
    this._volume = state.volume;
    /* Текущий сигнал */
    this._signal = {};
    /* Последнтй сигнал */
    this._lastSignal = state.lastSignal || { signalId: null };
    this._currentPositions = {};
    /* Объект запроса на обновление параметров {debug,proxy,timeframes,eventSubject} или false */
    this._updateRequested = state.updateRequested || false;
    /* Признак запроса на остановку сервиса [true,false] */
    this._stopRequested = state.stopRequested || false;
    /* Текущий статус сервиса */
    this._status = this._stopRequested
      ? STATUS_STOPPED
      : state.status || STATUS_STARTED;
    /* Дата и время запуска */
    this._startedAt = state.startedAt || dayjs().toJSON();
    /* Дата и время остановки */
    this._endedAt = this._stopRequested
      ? dayjs().toJSON()
      : state.endedAt || "";
    /* События для отправки */
    this._events = [];

    /* Метаданные стореджа */
    this._metadata = state.metadata;
  }

  /**
   * Запрос текущего статуса сервиса
   *
   * @returns status
   * @memberof  Trader
   */
  get status() {
    return this._status;
  }

  /**
   * Запрос текущего признака обновления параметров
   *
   * @returns updateRequested
   * @memberof Trader
   */
  get updateRequested() {
    return this._updateRequested;
  }

  /**
   * События
   *
   * @readonly
   * @memberof Position
   */
  get events() {
    return this._events;
  }

  /**
   * Установка статуса сервиса
   *
   * @param {*} status
   * @memberof Trader
   */
  set status(status) {
    if (status) this._status = status;
    if (this._status === STATUS_STOPPED || this._status === STATUS_FINISHED)
      this._endedAt = dayjs().toJSON();
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Trader
   */
  log(...args) {
    if (this._debug) {
      this._context.log.info(`Trader ${this._eventSubject}:`, ...args);
    }
  }

  /**
   * Логирование в EventGrid в топик CPZ-LOGS
   *
   * @param {*} data
   * @memberof Trader
   */
  logEvent(data) {
    // Публикуем событие
    publishEvents(LOG_TOPIC, {
      service: TRADER_SERVICE,
      subject: this._eventSubject,
      eventType: LOG_TRADER_EVENT,
      data: {
        taskId: this._taskId,
        data
      }
    });
  }

  /**
   * Аварийная остановка проторговщика
   *
   * @param {*} msg
   * @memberof Trader
   */
  crash(msg) {
    this.log("crash()");
    throw new VError(
      {
        name: "TraderCrashError"
      },
      'Critical error while executing trader "%s" for user "%s" - "%s"',
      this._taskId,
      this._userId,
      msg
    );
  }

  /**
   *Создание новой позиции
   *
   * @param {*} positionId
   * @memberof Trader
   */
  _createPosition(positionId) {
    this.log("_createPosition()");
    let slippageStep;
    let deviation;
    if (this._signal.settings) {
      slippageStep = this._signal.settings.slippageStep || this._slippageStep;
      deviation = this._signal.settings.deviation || this._deviation;
    }
    this._currentPositions[positionId] = new Position({
      mode: this._mode,
      positionId,
      traderId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      adviserId: this._adviserId,
      exchange: this._exchange,
      exchangeId: this._exchangeId,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      slippageStep,
      deviation,
      log: this.log.bind(this),
      logEvent: this.logEvent.bind(this)
    });
  }

  /**
   * Загрузка существующей позиции
   *
   * @memberof Trader
   */
  async _loadPosition(positionId) {
    this.log("_loadPosition()");
    try {
      // Если позиция еще не загружена
      if (
        !Object.prototype.hasOwnProperty.call(
          this._currentPositions,
          positionId
        )
      ) {
        // Запрашиваем из стореджа
        this.log("loading...");
        const positionsState = await getPositonByKey({
          partitionKey: this._taskId,
          rowkey: positionId
        });

        // Создем экземпяр позиции
        this._currentPositions[positionsState.positionId] = new Position({
          ...positionsState,
          log: this.log.bind(this),
          logEvent: this.logEvent.bind(this)
        });
      }
    } catch (error) {
      throw new VError(
        {
          name: "PositionNotFound",
          cause: error,
          info: {
            positionId
          }
        },
        'Error while loading position id "%s"',
        positionId
      );
    }
  }

  /**
   * Обработка нового сигнала
   *
   * @param {*} signal
   * @memberof Trader
   */
  async handleSignal(signal) {
    this.log("handleSignal()");
    try {
      // Обновить текущий сигнал
      this._signal = signal;
      // Если сигнал уже обрабатывалась - выходим
      if (this._signal.signalId === this._lastSignal.signalId) return;
      // Если сигнал на открытие позиции
      if (
        this._signal.action === TRADE_ACTION_LONG ||
        this._signal.action === TRADE_ACTION_SHORT
      ) {
        // Создаем новую позицию
        this._createPosition(this._signal.positionId);
        // Создаем ордер на открытие позиции
        this._currentPositions[this._signal.positionId].createEntryOrder(
          this._signal
        );
      } else {
        // Если сигнал на закрытие позиции

        // Загружаем существующую позицию
        await this._loadPosition(this._signal.positionId);
        // Создаем ордер на закрытие позиции
        this._currentPositions[this._signal.positionId].createExitOrder(
          this._signal
        );
      }
      // Созданный ордер
      const createdOrder = this._currentPositions[this._signal.positionId]
        .currentOrder;
      // Если тип созданного ордера - рыночнй ордер
      if (createdOrder.orderType === ORDER_TYPE_MARKET) {
        // Немедленно исполянем ордер
        await this.executeOrders([createdOrder]);
      } else {
        // Если любой другой тип ордера
        // Сохраняем позицию в сторедж
        await this._currentPositions[this._signal.positionId].save();
      }
      // Последний обработанный сигнал
      this._lastSignal = this._signal;
    } catch (error) {
      throw new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            adviserId: this._adviserId,
            userId: this._userId,
            eventSubject: this._eventSubject
          }
        },
        'Error while handling signal trader "%s"',
        this._taskId
      );
    }
  }

  /**
   * Исполнение ордеров
   *
   * @param {*} orders
   */
  async executeOrders(orders) {
    this.log("executeOrders()");
    // Для каждого ордера
    /* eslint-disable no-restricted-syntax */
    for (const order of orders) {
      /* eslint-disable no-await-in-loop */
      try {
        const orderResult = { ...order };
        // Если задача - проверить исполнения объема
        if (order.task === ORDER_TASK_CHECKLIMIT) {
          // Если режим - в реальном времени
          if (this._mode === REALTIME_MODE) {
            // Запрашиваем статус ордера с биржи
            // TODO: CheckOrderStatus API CALL
            orderResult.state = ORDER_STATUS_CLOSED;
            orderResult.executed = this._volume;
          } else {
            // Если режим - эмуляция или бэктест
            // Считаем, что ордер исполнен
            orderResult.state = ORDER_STATUS_CLOSED;
            // Полностью - т.е. по заданному объему
            orderResult.executed = this._volume;
          }
          // Если задача - выставить лимитный или рыночный ордер
        } else if (
          order.task === ORDER_TASK_SETLIMIT ||
          order.task === ORDER_TASK_OPENBYMARKET
        ) {
          // Устанавливаем объем из параметров
          const orderToExecute = { ...order, volume: this._volume };
          // Если режим - в реальном времени
          if (this._mode === REALTIME_MODE) {
            // Публикуем ордер на биржу
            // TODO: SendOrder API CALL
            const result = { externalId: uuid() };
            orderResult.state = ORDER_STATUS_POSTED;
            orderResult.externalId = result.externalId;
          } else if (order.orderType === ORDER_TYPE_LIMIT) {
            // Если режим - эмуляция или бэктест
            // Если тип ордера - лимитный
            // Считаем, что ордер успешно выставлен на биржу
            orderResult.state = ORDER_STATUS_POSTED;
          } else {
            // Если режим - эмуляция или бэктест
            // Если тип ордера - по рынку
            // Считаем, что ордер исполнен
            orderResult.state = ORDER_STATUS_CLOSED;
            // Полностью - т.е. по заданному объему
            orderResult.executed = orderToExecute.volume;
          }
        }
        // Загружаем позицию
        this._loadPosition(order.positionId);

        // Сохраняем ордер в позиции и генерируем событие
        this._events.push(
          this._currentPositions[order.positionId].handleOrder(orderResult)
        );
        // Сохраняем состояние позиции в сторедж
        await this._currentPositions[order.positionId].save();
      } catch (error) {
        throw new VError(
          {
            name: "ExecutingOrder",
            cause: error,
            info: {
              order
            }
          },
          'Error while executing order "%s"',
          order.orderId
        );
      }
      /* eslint-disable no-await-in-loop */
    }
    /* eslint-disable no-restricted-syntax */
  }

  /**
   * Запрос всего текущего состояния
   *
   * @returns {object}
   * @memberof Trader
   */
  getCurrentState() {
    return {
      eventSubject: this._eventSubject,
      taskId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      adviserId: this._adviserId,
      mode: this._mode,
      debug: this._debug,
      exchange: this._exchange,
      exchangeId: this._exchangeId,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      slippageStep: this._slippageStep,
      deviation: this._deviation,
      volume: this._volume,
      lastSignal: this._lastSignal,
      updateRequested: this._updateRequested,
      stopRequested: this._stopRequested,
      status: this._status,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      initialized: this._initialized,
      metadata: this._metadata
    };
  }

  /**
   * Установка новых параметров
   *
   * @param {object} [updatedFields=this._updateRequested]
   * @memberof Trader
   */
  setUpdate(updatedFields = this._updateRequested) {
    this.log(`setUpdate()`, updatedFields);
    this._eventSubject = updatedFields.eventSubject || this._eventSubject;
    this._debug = updatedFields.debug || this._debug;
    this._slippageStep = updatedFields.slippageStep || this._slippageStep;
    this._deviation = updatedFields.deviation || this._deviation;
    this._volume = updatedFields.volume || this._volume;
  }

  /**
   * Сохранение всего текущего состояния в локальное хранилище
   *
   * @memberof Trader
   */
  async save() {
    this.log(`save()`);
    try {
      // Сохраняем состояние в локальном хранилище
      await saveTraderState(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            userId: this._userId,
            adviserId: this._adviserId,
            eventSubject: this._eventSubject
          }
        },
        'Failed to update trader "%s" state',
        this._taskId
      );
    }
  }

  /**
   * Завершение работы итерации
   *
   * @param {*} status
   * @param {*} error
   * @memberof Trader
   */
  async end(status, error) {
    try {
      this.log(`end()`);
      this._status = status;
      this._error = error;
      this._updateRequested = false; // Обнуляем запрос на обновление параметров
      this._stopRequested = false; // Обнуляем запрос на остановку сервиса

      await this.save();
    } catch (err) {
      if (err instanceof VError) {
        throw err;
      } else {
        throw new VError(
          {
            name: "TraderError",
            cause: error
          },
          'Failed to end trader "%s" execution',
          this._taskId
        );
      }
    }
  }
}

export default Trader;

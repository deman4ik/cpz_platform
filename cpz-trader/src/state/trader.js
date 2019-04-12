import Log from "cpz/log";
import ServiceError from "cpz/error";
import { combineTraderSettings } from "cpz/utils/settings";
import {
  REALTIME_MODE,
  BACKTEST_MODE,
  EMULATOR_MODE,
  TRADE_ACTION_LONG,
  TRADE_ACTION_SHORT,
  POS_STATUS_NEW,
  POS_STATUS_CANCELED,
  POS_STATUS_CLOSED,
  POS_STATUS_CLOSED_AUTO,
  POS_STATUS_OPEN,
  ORDER_STATUS_OPEN,
  ORDER_DIRECTION_BUY,
  ORDER_DIRECTION_SELL,
  STATUS_PENDING,
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_ERROR,
  createTraderSlug
} from "cpz/config/state";
import {
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATED_EVENT,
  SIGNALS_HANDLED_EVENT,
  TRADES_ORDER_EVENT,
  TRADES_POSITION_EVENT,
  ERROR_TRADER_WARN_EVENT,
  ERROR_TRADER_ERROR_EVENT
} from "cpz/events/types";
import { flatten } from "cpz/utils/helpers";
import Position from "./position";

class Trader {
  constructor(state) {
    try {
      /* Уникальный идентификатор задачи */
      this._taskId = state.taskId;
      /* Идентификатор робота */
      this._robotId = state.robotId;
      /* Идентификатор пользователя */
      this._userId = state.userId;
      /* Код биржи */
      this._exchange = state.exchange;
      /* Базовая валюта */
      this._asset = state.asset;
      /* Котировка валюты */
      this._currency = state.currency;
      /* Таймфрейм */
      this._timeframe = state.timeframe;
      /* Ключ партиции */
      this._PartitionKey =
        state.PartitionKey ||
        createTraderSlug({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency
        });
      /* Настройки трейдера */
      this._settings = combineTraderSettings(state.settings);
      /* Статус */
      this._status = state.status || STATUS_PENDING;
      this._stopRequested = state.stopRequested || false;
      /* Текущий сигнал */
      this._signal = {};
      /* Последнтй сигнал */
      this._lastSignal = state.lastSignal || { signalId: null };
      /* Последняя цена */
      this._lastPrice = state.lastPrice || {
        price: null,
        time: null,
        timestamp: null,
        candleId: null,
        tickId: null
      };
      /* Последнее действие */
      this._lastAction = state.lastAction || { actionId: null };
      /* Текущие позиции */
      this._positions = {};
      this.positionInstances = state.activePositions;
      /* События для отправки */
      this._eventsToSend = {};
      /* Ордера для обработки */
      this._ordersToExecute = {};
    } catch (e) {
      Log.error(e);
      throw e;
    }
  }

  get taskId() {
    return this._taskId;
  }

  /**
   * События для отправки
   *
   * @readonly
   * @memberof Position
   */
  get events() {
    return Object.values(this._eventsToSend);
  }

  /**
   * Ордера для обработки
   *
   * @readonly
   * @memberof Position
   */
  get orders() {
    return Object.values(this._ordersToExecute);
  }

  get positions() {
    return Object.values(this._positions).map(position => position.state);
  }

  get activePositions() {
    return this.positions.filter(
      position =>
        position.status === POS_STATUS_NEW ||
        position.status === POS_STATUS_OPEN
    );
  }

  set positionInstances(positions) {
    if (positions && Array.isArray(positions) && positions.length > 0)
      positions.forEach(position => {
        this._positions[position.id] = new Position(position);
      });
  }

  get positionInstances() {
    return Object.values(this._positions);
  }

  get activePositionInstances() {
    return this.positionInstances.filter(
      position =>
        position.status === POS_STATUS_NEW ||
        position.status === POS_STATUS_OPEN
    );
  }

  get hasActivePositions() {
    return this.activePositions.length > 0;
  }

  set lastAction(action) {
    if (action && action.actionId) this._lastAction = action;
  }

  get stopRequested() {
    return this._stopRequested;
  }

  start() {
    this._status = STATUS_STARTED;
    this._stopRequested = false;
    this._eventsToSend.Start = {
      eventType: TASKS_TRADER_STARTED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      }
    };
  }

  stop() {
    this._status = STATUS_STOPPED;
    this._stopRequested = false;
    this._eventsToSend.Stop = {
      eventType: TASKS_TRADER_STOPPED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      }
    };
  }

  update(settings) {
    this._settings = combineTraderSettings(settings);
    this._eventsToSend.Update = {
      eventType: TASKS_TRADER_UPDATED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      }
    };
  }

  _baseOrder(order) {
    return {
      ...order,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      traderId: this._taskId
    };
  }

  requestStop() {
    try {
      this._stopRequested = true;
      this._closeActivePositions();
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_STOP_ERROR,
          cause: e
        },
        "Failed to stop trader"
      );
    }
  }

  _closePosition(positionId) {
    try {
      this._positions[positionId].closeRequested = true;
      const ordersToExecute = this._positions[
        positionId
      ].getOrdersToClosePosition(this._settings);
      ordersToExecute.forEach(order => {
        this._ordersToExecute[order.orderId] = this._baseOrder(order);
      });
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_CLOSE_POSITION_ERROR,
          cause: e,
          info: {
            positionId
          }
        },
        "Failed to close position"
      );
    }
  }

  _closeActivePositions() {
    try {
      this.activePositions.forEach(({ id }) => {
        this._closePosition(id);
      });
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_CLOSE_ACTIVE_POSITIONS_ERROR,
          cause: e
        },
        "Failed to close active positions"
      );
    }
  }

  _checkPositions() {
    try {
      if (!this._settings.multiPosition) {
        if (
          this._settings.mode === REALTIME_MODE ||
          this._settings.mode === EMULATOR_MODE
        ) {
          // In realtime and emulation - closing all active positions
          this._closeActivePositions();
        } else if (this._settings.mode === BACKTEST_MODE) {
          if (this.activePositions.length > 0) {
            throw new ServiceError(
              {
                name: ServiceError.types.TRADER_CREATE_POSITION_ERROR,
                info: {
                  activePositions: this.activePositions.map(position => ({
                    id: position.id,
                    code: position.code,
                    status: position.status
                  }))
                }
              },
              "Failed to create new position, active positions found"
            );
          }
        }
      }
    } catch (e) {
      if (e instanceof ServiceError) throw e;
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_ERROR,
          cause: e,
          info: {
            taskId: this._taskId
          }
        },
        "Failed to check positions"
      );
    }
  }

  /**
   * Создание новой позиции
   *
   * @param {object} signal
   * @memberof Trader
   */
  _createPosition({ positionId, action, settings: { positionCode } }) {
    Log.debug("Creating new Position", positionCode, positionId);
    this._positions[positionId] = new Position({
      id: positionId,
      code: positionCode,
      direction:
        action === TRADE_ACTION_LONG
          ? ORDER_DIRECTION_BUY
          : ORDER_DIRECTION_SELL
    });
  }

  /**
   * Обработка нового сигнала
   *
   * @param {object} signal
   * @memberof Trader
   */
  handleSignal(signal) {
    try {
      if (!signal) throw new Error("No signal data");
      Log.debug(
        `handleSignal() position: ${signal.settings.positionCode}, ${
          signal.action
        }, ${signal.price}, from ${signal.priceSource}`
      );
      // Если сигнал уже обрабатывалась - выходим
      if (signal.signalId === this._lastSignal.signalId) {
        Log.warn("Signal '%s' already handled.", signal.signalId);
        return;
      }
      // Если сигнал от другого робота
      if (signal.robotId !== this._robotId) {
        Log.warn("Wrong signal '%s'", signal.signalId);
        return;
      }

      this._eventsToSend[
        `S-${signal.signalId}`
      ] = this._createSignalHandledEvent({ signalId: signal.signalId });

      // Если сигнал на открытие позиции
      if (
        signal.action === TRADE_ACTION_LONG ||
        signal.action === TRADE_ACTION_SHORT
      ) {
        // Проверка единичной позиции
        this._checkPositions();

        // Создаем новую позицию
        this._createPosition(signal);
        // Создаем ордер на открытие позиции
        this._positions[signal.positionId].createEntryOrder(
          signal,
          this._settings
        );
      } else {
        // Если сигнал на закрытие позиции
        if (
          !Object.prototype.hasOwnProperty.call(
            this._positions,
            signal.positionId
          )
        ) {
          Log.warn("Position '%s' not found!", signal.positionId);
          return;
        }
        // Создаем ордер на закрытие позиции
        this._positions[signal.positionId].createExitOrder(
          signal,
          this._settings
        );
        // Если текущая позиция еще не открыта
        if (this._positions[signal.positionId].status === POS_STATUS_NEW) {
          // Отменяем позицию
          this._positions[signal.positionId].status = POS_STATUS_CANCELED;
          // Если вход в текущую позицию все еще открыт
        } else if (
          this._positions[signal.positionId].entryStatus === ORDER_STATUS_OPEN
        ) {
          // Проверяем ордер на открытие
          const ordersToExecute = this._positions[
            signal.positionId
          ].getOrdersToExecute();

          ordersToExecute.forEach(order => {
            this._ordersToExecute[order.orderId] = this._baseOrder(order);
          });
        }
      }
      if (
        this._positions[signal.positionId].entryStatus !== ORDER_STATUS_OPEN &&
        this._positions[signal.positionId].status !== POS_STATUS_CANCELED &&
        this._positions[signal.positionId].status !== POS_STATUS_CLOSED &&
        this._positions[signal.positionId].status !== POS_STATUS_CLOSED_AUTO
      ) {
        // Созданный ордер
        const createdOrder = this._positions[signal.positionId].currentOrder;
        // Если есть задача для ордера
        if (createdOrder.task) {
          // Немедленно исполянем ордер
          this._ordersToExecute[createdOrder.orderId] = this._baseOrder(
            createdOrder
          );
        }
      }

      // Последний обработанный сигнал
      this._lastSignal = signal;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.TRADER_HANDLE_SIGNAL_ERROR,
          cause: e,
          info: {
            taskId: this._taskId,
            ...signal
          }
        },
        "Error while handling signal"
      );
      Log.exception(error);
      this._eventsToSend[
        `O-${signal.signalId}`
      ] = this._createSignalHandledEvent({
        signalId: signal.signalId,
        success: false,
        error: error.json
      });
    }
  }

  checkOrders() {
    try {
      const ordersToExecute = flatten(
        this.activePositionInstances.map(position =>
          position.getOrdersToExecute()
        )
      );
      ordersToExecute.forEach(order => {
        this._ordersToExecute[order.orderId] = this._baseOrder(order);
      });
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_CHECK_OPEN_ERROR,
          cause: e,
          info: {
            taskId: this._taskId
          }
        },
        "Failed to check open orders"
      );
    }
  }

  checkPrice(currentPrice) {
    try {
      if (!currentPrice || !currentPrice.price || !currentPrice.time) {
        Log.error("No current price!");
        return;
      }
      const { price, time, timestamp, candleId, tickId } = currentPrice;
      if (this._lastPrice.time && this._lastPrice.time >= time) {
        Log.warn(
          "Already checked same or newer price. Last checked price time '%s', current price time '%s'",
          this._lastPrice.timestamp,
          timestamp
        );
        return;
      }

      this._lastPrice = {
        price,
        time,
        timestamp,
        candleId,
        tickId
      };

      const ordersToExecute = flatten(
        this.activePositionInstances.map(position =>
          position.getOrdersToExecuteByPrice(
            this._lastPrice.price,
            this._settings
          )
        )
      );
      ordersToExecute.forEach(order => {
        this._ordersToExecute[order.orderId] = this._baseOrder(order);
      });
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_CHECK_PRICE_ERROR,
          cause: e,
          info: {
            taskId: this._taskId,
            currentPrice
          }
        },
        "Failed to check price"
      );
    }
  }

  // TODO: Log warn events if debug is on

  _createSignalHandledEvent({ signalId, success = true, error = null }) {
    return {
      eventType: SIGNALS_HANDLED_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          traderId: this._taskId,
          signalId,
          success,
          error
        }
      }
    };
  }

  _baseTradeEvent(event) {
    return {
      ...event,
      mode: this._settings.mode,
      traderId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe
    };
  }

  _createErrorEvent(error) {
    const { critical = false } = error.info;
    return {
      eventType: critical ? ERROR_TRADER_ERROR_EVENT : ERROR_TRADER_WARN_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId,
          critical,
          error
        }
      }
    };
  }

  /**
   * Создать событие Ордер
   *
   * @param {*} order
   */
  _createOrderEvent(order) {
    return {
      eventType: TRADES_ORDER_EVENT,
      eventData: {
        subject: this._taskId,
        data: this._baseTradeEvent(order)
      }
    };
  }

  _createErrorOrderEvent(order) {
    const { critical = false } = order.error.info;
    return {
      eventType: critical ? ERROR_TRADER_ERROR_EVENT : ERROR_TRADER_WARN_EVENT,
      eventData: {
        subject: this._taskId,
        data: {
          taskId: this._taskId,
          critical,
          error: order.error
        }
      }
    };
  }

  _createPositionEvent(position) {
    return {
      eventType: TRADES_POSITION_EVENT,
      eventData: {
        subject: this._taskId,
        data: this._baseTradeEvent(position)
      }
    };
  }

  handleOrders(orders) {
    try {
      Log.debug("handleOrders", orders);
      if (!Array.isArray(orders)) throw new Error("Orders are not array");

      orders.forEach(order => {
        // Сохраняем ордер в позиции и генерируем события
        this._positions[order.positionId].handleOrder(order);

        // Если ордер в статусе закрыт или отменен
        /*  if (
          order.status === ORDER_STATUS_CLOSED ||
          order.status === ORDER_STATUS_CANCELED
        ) { */
        // генерируем событие ордер
        this._eventsToSend[`O-${order.orderId}`] = this._createOrderEvent(
          order
        );
        // генерируем событие позиция
        this._eventsToSend[`P-${order.positionId}`] = this._createPositionEvent(
          this._positions[order.positionId].state
        );
        // или возникла ошибка при работе с ордером на бирже
        //   } else

        if (order.error) {
          // генерируем событие ошибка трейдера
          this._eventsToSend[
            `OE-${order.orderId}`
          ] = this._createErrorOrderEvent(order);
        }
      });

      Log.debug("handleOrders ordersToExecute", this._ordersToExecute);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_HANDLE_ORDERS_ERROR,
          cause: e
        },
        "Failed to handle orders"
      );
    }
  }

  setError(error) {
    try {
      const { critical = false } = error.info;
      if (critical) this._status = STATUS_ERROR;
      this._error = error;
      this._eventsToSend.error = this._createErrorEvent(error);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_SET_ERROR_ERROR,
          cause: e
        },
        "Failed to set error"
      );
    }
  }

  /**
   * Запрос всего текущего состояния
   *
   * @returns {object}
   * @memberof Trader
   */
  get state() {
    return {
      PartitionKey: this._PartitionKey,
      RowKey: this._taskId,
      taskId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      status: this._status,
      stopRequested: this._stopRequested,
      settings: this._settings,
      lastSignal: this._lastSignal,
      lastPrice: this._lastPrice,
      lastAction: this._lastAction,
      activePositions: this.activePositions,
      hasActivePositions: this.hasActivePositions
    };
  }

  get props() {
    return {
      taskId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe
    };
  }
}

export default Trader;

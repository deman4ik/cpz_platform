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
  ORDER_POS_DIR_EXIT,
  ORDER_STATUS_OPEN,
  ORDER_STATUS_CANCELED,
  ORDER_STATUS_CLOSED,
  ORDER_DIRECTION_BUY,
  ORDER_DIRECTION_SELL,
  ORDER_TASK_CANCEL,
  STATUS_PENDING,
  STATUS_STARTED,
  STATUS_STOPPED,
  createTraderSlug
} from "cpz/config/state";
import {
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATED_EVENT,
  TRADES_ORDER_EVENT,
  TRADES_POSITION_EVENT,
  ERROR_TRADER_WARN_EVENT,
  ERROR_TRADER_ERROR_EVENT
} from "cpz/events/types";
import { flatten } from "cpz/utils/helpers";
import dayjs from "cpz/utils/lib/dayjs";
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
      /* Текущий сигнал */
      this._signal = {};
      /* Последнтй сигнал */
      this._lastSignal = state.lastSignal || { signalId: null };
      /* Последняя цена */
      this._lastPrice = state.lastPrice || {
        price: null,
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

  /**
   * События для отправки
   *
   * @readonly
   * @memberof Position
   */
  get events() {
    return this._eventsToSend;
  }

  /**
   * Ордера для обработки
   *
   * @readonly
   * @memberof Position
   */
  get orders() {
    return this._ordersToExecute;
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

  set lastAction(action) {
    if (action && action.actionId) this._lastAction = action;
  }

  start() {
    this._status = STATUS_STARTED;
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

  closeActivePositions() {
    try {
      const ordersToExecute = flatten(
        this.activePositionInstances.map(position =>
          position.getOrdersToClosePosition()
        )
      );
      Log.warn("ordersToExecute", ordersToExecute);
      ordersToExecute.forEach(order => {
        this._ordersToExecute[order.orderId] = this._baseOrder(order);
      });
      Log.warn("this._ordersToExecute", this._ordersToExecute);
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
          this.closeActivePositions();
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
        }
      }
      if (
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
      throw new ServiceError(
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
    }
  }

  checkPrice({ price, timestamp, candleId, tickId }) {
    try {
      if (!price || !timestamp) {
        Log.error("No current price!");
        return;
      }
      if (
        dayjs.utc(this._lastPrice.timestamp).valueOf() >=
        dayjs.utc(timestamp).valueOf()
      ) {
        Log.warn(
          "Already checked newer price. Last checked price time '%s', current price time '%s'",
          this._lastPrice.timestamp,
          timestamp
        );
      } else {
        this._lastPrice = {
          price,
          timestamp,
          candleId,
          tickId
        };
      }

      const ordersToExecute = flatten(
        this.activePositionInstances.map(position =>
          position.getOrdersToExecute(this._lastPrice.price, this._settings)
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
            price,
            timestamp,
            candleId,
            tickId
          }
        },
        "Error while handling signal"
      );
    }
  }

  _baseTradeEvent(event) {
    return {
      ...event,
      mode: this._settings.mode,
      traderId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      adviserId: this._adviserId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe
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
      orders.forEach(order => {
        // Сохраняем ордер в позиции и генерируем события
        this._positions[order.positionId].handleOrder(order);

        if (
          order.status === ORDER_STATUS_CLOSED ||
          order.status === ORDER_STATUS_CANCELED
        ) {
          this._eventsToSend[`O-${order.orderId}`] = this._createOrderEvent(
            order
          );
          this._eventsToSend[
            `P-${order.positionId}`
          ] = this._createPositionEvent(
            this._positions[order.positionId].state
          );
        } else if (order.error) {
          this._eventsToSend[
            `O-${order.orderId}`
          ] = this._createErrorOrderEvent(order);
        }

        const currentOrder = { ...order };
        if (
          this._settings.mode !== BACKTEST_MODE &&
          order.exTimestamp &&
          order.status === ORDER_STATUS_OPEN &&
          dayjs.utc().diff(dayjs.utc(order.exTimestamp), "minute") >
            this._settings.openOrderTimeout
        ) {
          currentOrder.task = ORDER_TASK_CANCEL;
          this._ordersToExecute[currentOrder.orderId] = currentOrder;
        } else if (
          order.status === ORDER_STATUS_CANCELED &&
          order.positionCode === ORDER_POS_DIR_EXIT
        ) {
          this.closePosition(order.positionId);
        } else {
          this._ordersToExecute = {};
        }
      });
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
      settings: this._settings,
      lastSignal: this._lastSignal,
      lastPrice: this._lastPrice,
      lastAction: this._lastAction,
      activePositions: this.activePositions,
      hasActivePositions: this.activePositions.length > 0
    };
  }

  get currentState() {
    return {
      currentState: this.state,
      currentEvents: this.events,
      currentOrders: this.orders
    };
  }
}

export default Trader;

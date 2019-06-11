import ServiceError from "cpz/error";
import {
  ORDER_STATUS_CLOSED,
  ORDER_TASK_OPEN_MARKET,
  ORDER_TASK_OPEN_LIMIT,
  ORDER_TASK_CHECK,
  POS_STATUS_NEW,
  POS_STATUS_OPEN
} from "cpz/config/state";
import {
  TRADES_POSITION_EVENT,
  TRADES_ORDER_EVENT
} from "cpz/events/types/trades";
import { ERROR_TRADER_ERROR_EVENT } from "cpz/events/types/error";
import Trader from "cpzTrader/state/trader";

class TraderBacktester extends Trader {
  get bPositionEvents() {
    const positions = {};
    Object.keys(this._eventsToSend).forEach(key => {
      const event = this._eventsToSend[key];
      if (event.eventType === TRADES_POSITION_EVENT)
        positions[key] = event.eventData.data;
    });
    return positions;
  }

  get bOrderEvents() {
    const orders = {};
    Object.keys(this._eventsToSend).forEach(key => {
      const event = this._eventsToSend[key];
      if (event.eventType === TRADES_ORDER_EVENT)
        orders[key] = event.eventData.data;
    });
    return orders;
  }

  get bErrorEvents() {
    return Object.values(this._eventsToSend)
      .filter(({ eventType }) => eventType === ERROR_TRADER_ERROR_EVENT)
      .map(({ eventData: { data } }) => data);
  }

  bClearEvents() {
    this._eventsToSend = {};
  }

  bClearPositions() {
    const activePositions = {};

    Object.keys(this._positions).forEach(key => {
      const position = this._positions[key];

      if (
        position.status === POS_STATUS_NEW ||
        position.status === POS_STATUS_OPEN
      )
        activePositions[key] = position;
    });

    this._positions = activePositions;
  }

  // Обработка новой свечи
  bHandleCandle(candle) {
    try {
      this.log(
        "Trader handleCandle()",
        `t: ${candle.timestamp}, o: ${candle.open}, h: ${candle.high}, l: ${
          candle.low
        }, c:${candle.close}`
      );
      this.handleCurrentPrice({
        price: candle.close,
        time: candle.time,
        timestamp: candle.timestamp,
        candleId: candle.id,
        tickId: null
      });
      this.checkPrice();
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_ERROR,
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            userId: this._userId
          }
        },
        'Error while handling candle trader "%s"',
        this._taskId
      );
    }
  }

  bExecuteOrders() {
    try {
      while (Object.keys(this._ordersToExecute).length > 0) {
        const executedOrders = Object.values(this._ordersToExecute).map(
          order => {
            const orderResult = { ...order };
            // Если задача - проверить исполнения объема
            if (order.task === ORDER_TASK_CHECK) {
              // Считаем, что ордер исполнен
              orderResult.status = ORDER_STATUS_CLOSED;
              // Полностью - т.е. по заданному объему
              orderResult.executed = orderResult.volume;
              orderResult.remaining = 0;
              orderResult.exLastTrade = this._lastPrice.timestamp;

              // Если задача - выставить лимитный или рыночный ордер
            } else if (
              order.task === ORDER_TASK_OPEN_LIMIT ||
              order.task === ORDER_TASK_OPEN_MARKET
            ) {
              // Устанавливаем объем из параметров

              // Если тип ордера - по рынку
              // Считаем, что ордер исполнен
              orderResult.status = ORDER_STATUS_CLOSED;
              orderResult.exId = orderResult.orderId;
              orderResult.exTimestamp = this._lastPrice.timestamp;
              // Полностью - т.е. по заданному объему
              orderResult.executed = orderResult.volume;
              orderResult.remaining = 0;
              orderResult.exLastTrade = this._lastPrice.timestamp;
              orderResult.price = orderResult.price;
              orderResult.average = orderResult.price;
            }
            orderResult.task = null;
            return orderResult;
          }
        );
        this._ordersToExecute = {};
        this.handleOrders(executedOrders);
      }
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.TRADER_ERROR,
          cause: error,
          info: {
            taskId: this._taskId,
            robotId: this._robotId,
            userId: this._userId
          }
        },
        'Error while executing orders trader "%s"',
        this._taskId
      );
    }
  }
}

export default TraderBacktester;

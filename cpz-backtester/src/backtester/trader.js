import ServiceError from "cpz/error";
import {
  ORDER_STATUS_OPEN,
  ORDER_STATUS_CLOSED,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TASK_OPENBYMARKET,
  ORDER_TASK_SETLIMIT,
  ORDER_TASK_CHECKLIMIT
} from "cpz/config/state";
import Trader from "cpzTrader/trader";

class TraderBacktester extends Trader {
  clearEvents() {
    this._eventsToSend = {};
  }

  // Обработка новой свечи
  handleCandle(candle) {
    try {
      // По умолчанию берем цену закрытия свечи
      let price = candle.close;
      // Если в последнем сигнале указан источник цены
      const { priceSource } = this._lastSignal;
      if (
        priceSource &&
        ["open", "close", "high", "low"].includes(priceSource)
      ) {
        // берем нужное поле
        price = candle[priceSource];
      }
      this.log(
        "handleCandle()",
        `t: ${candle.timestamp}, o: ${candle.open}, h: ${candle.high}, l: ${
          candle.low
        }, c:${candle.close}`,
        `price: ${price}`
      );
      this.checkPrice({
        price,
        timestamp: candle.timestamp,
        candleId: candle.id,
        tickId: null
      });
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

  executeOrders() {
    try {
      while (Object.keys(this._ordersToExecute).length > 0) {
        const executedOrders = Object.values(this._ordersToExecute).map(
          order => {
            const orderResult = { ...order };
            // Если задача - проверить исполнения объема
            if (order.task === ORDER_TASK_CHECKLIMIT) {
              // Если режим - эмуляция или бэктест
              // Считаем, что ордер исполнен
              orderResult.status = ORDER_STATUS_CLOSED;
              // Полностью - т.е. по заданному объему
              orderResult.executed = order.volume;

              // Если задача - выставить лимитный или рыночный ордер
            } else if (
              order.task === ORDER_TASK_SETLIMIT ||
              order.task === ORDER_TASK_OPENBYMARKET
            ) {
              // Устанавливаем объем из параметров
              const orderToExecute = { ...order };
              if (order.task === ORDER_TASK_OPENBYMARKET) {
                orderToExecute.price = this._lastPrice.price;
              }
              if (order.orderType === ORDER_TYPE_LIMIT) {
                // Если режим - эмуляция или бэктест
                // Если тип ордера - лимитный
                // Считаем, что ордер успешно выставлен на биржу
                orderResult.status = ORDER_STATUS_OPEN;
                orderResult.exLastTrade = this._lastPrice.timestamp;
                orderResult.average = this._lastPrice.price;
              } else if (order.orderType === ORDER_TYPE_MARKET) {
                // Если режим - эмуляция или бэктест
                // Если тип ордера - по рынку
                // Считаем, что ордер исполнен
                orderResult.status = ORDER_STATUS_CLOSED;
                // Полностью - т.е. по заданному объему
                orderResult.executed = orderToExecute.volume;
                orderResult.exLastTrade = this._lastPrice.timestamp;
                orderResult.average = orderResult.price;
              }
            }
            orderResult.task = null;
            return orderResult;
          }
        );
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

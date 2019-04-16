import Log from "cpz/log";
import ServiceError from "cpz/error";
import dayjs from "cpz/utils/lib/dayjs";
import {
  REALTIME_MODE,
  EMULATOR_MODE,
  ORDER_STATUS_OPEN,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_CANCELED,
  ORDER_TASK_OPEN_MARKET,
  ORDER_TASK_OPEN_LIMIT,
  ORDER_TASK_CHECK,
  ORDER_TASK_CANCEL,
  createCurrentPriceSlug
} from "cpz/config/state";
import {
  createOrderEX,
  cancelOrderEX,
  checkOrderEX
} from "cpz/connector-client/orders";
import { getCurrentPrice } from "cpz/tableStorage-client/market/currentPrices";
import { traderStateToCommonProps } from "../utils/helpers";

async function executeOrder(state, order) {
  let orderResult = { ...order };

  try {
    if (!orderResult.task) {
      Log.error("No order task!", orderResult);
      return orderResult;
    }
    const {
      exchange,
      asset,
      currency,
      timeframe,
      userId,
      lastPrice,
      settings
    } = state;
    let currentPrice = lastPrice;

    // Если задача - проверить исполнения объема
    if (order.task === ORDER_TASK_CHECK) {
      // Если режим - в реальном времени
      if (settings.mode === REALTIME_MODE) {
        // Запрашиваем статус ордера с биржи
        const currentOrder = await checkOrderEX({
          exchange,
          asset,
          currency,
          userId,
          keys: settings.keys,
          exId: order.exId
        });

        orderResult = { ...orderResult, ...currentOrder };
      } else {
        // Если режим - эмуляция или бэктест
        // Считаем, что ордер исполнен
        orderResult.status = ORDER_STATUS_CLOSED;
        // Полностью - т.е. по заданному объему
        orderResult.executed = order.volume;
        orderResult.remaining = 0;
        orderResult.exLastTrade = currentPrice.timestamp;
      }
      // Если задача - выставить лимитный или рыночный ордер
    } else if (
      order.task === ORDER_TASK_OPEN_LIMIT ||
      order.task === ORDER_TASK_OPEN_MARKET
    ) {
      const orderToExecute = { ...order };
      if (settings.mode === REALTIME_MODE || settings.mode === EMULATOR_MODE) {
        if (order.task === ORDER_TASK_OPEN_MARKET) {
          try {
            const marketPrice = await getCurrentPrice(
              createCurrentPriceSlug({ exchange, asset, currency })
            );
            if (marketPrice && marketPrice.price) {
              currentPrice = marketPrice;
              orderToExecute.price = marketPrice.price;
            }
          } catch (e) {
            Log.exception(e);
          }
        }
      }
      // Если режим - в реальном времени
      if (settings.mode === REALTIME_MODE) {
        // Публикуем ордер на биржу
        const currentOrder = await createOrderEX({
          exchange,
          asset,
          currency,
          userId,
          keys: settings.keys,
          order: {
            direction: orderToExecute.direction,
            volume: orderToExecute.volume,
            price: orderToExecute.price,
            params: {} // TODO
          }
        });

        orderResult = {
          ...orderResult,
          ...currentOrder,
          status: ORDER_STATUS_OPEN,
          candleTimestamp: dayjs
            .utc()
            .add(-timeframe, "minute")
            .startOf("minute")
            .toISOString()
        };
      } else {
        if (order.task === ORDER_TASK_OPEN_LIMIT) {
          // Если режим - эмуляция или бэктест
          // Если тип ордера - лимитный
          // Считаем, что ордер успешно выставлен на биржу
          orderResult.status = ORDER_STATUS_OPEN;
          orderResult.exId = order.orderId;
          orderResult.exTimestamp = currentPrice.timestamp;
          orderResult.average = currentPrice.price;
          orderResult.remaining = order.volume;
        }
        if (order.task === ORDER_TASK_OPEN_MARKET) {
          // Если режим - эмуляция или бэктест
          // Если тип ордера - по рынку
          // Считаем, что ордер исполнен
          orderResult.status = ORDER_STATUS_CLOSED;
          orderResult.exId = order.orderId;
          orderResult.exTimestamp = currentPrice.timestamp;
          // Полностью - т.е. по заданному объему
          orderResult.executed = orderToExecute.volume;
          orderResult.remaining = 0;
          orderResult.exLastTrade = currentPrice.timestamp;
          orderResult.price = currentPrice.price;
          orderResult.average = currentPrice.price;
        }
      }
    } else if (order.task === ORDER_TASK_CANCEL) {
      if (settings.mode === REALTIME_MODE) {
        const currentOrder = await cancelOrderEX({
          exchange,
          asset,
          currency,
          userId,
          keys: settings.keys,
          exId: order.exId
        });

        orderResult = { ...orderResult, ...currentOrder };
      } else {
        orderResult = { ...orderResult, status: ORDER_STATUS_CANCELED };
      }
    }
    orderResult.task = null;
    orderResult.error = null;
    orderResult.lastCheck = dayjs.utc().toISOString();
    Log.debug("order execution result", orderResult);

    return orderResult;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_EXECUTE_ORDER_ERROR,
        cause: e,
        info: { ...traderStateToCommonProps(state), ...order }
      },
      "Failed to execute order"
    );

    Log.error(error);

    // Возвращаем ордер как есть
    orderResult.error = error.json;
    return orderResult;
  }
}

export default executeOrder;
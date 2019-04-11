import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import { CANDLE_PREVIOUS, createTraderSlug } from "cpz/config/state";
import { getActiveTradersBySlug } from "cpz/tableStorage-client/control/traders";
import {
  getTraderActionByKeys,
  saveTraderAction
} from "cpz/tableStorage-client/control/traderActions";
import { PRICE } from "../config";

async function handlePrice(currentPrice) {
  try {
    Log.debug("handlePrice", currentPrice);
    const { exchange, asset, currency } = currentPrice;
    const traders = await getActiveTradersBySlug(
      createTraderSlug({
        exchange,
        asset,
        currency
      })
    );
    if (traders && traders.length > 0) {
      await Promise.all(
        traders.map(async ({ taskId, lastPrice }) => {
          try {
            const { time } = lastPrice;
            Log.warn(
              "handlePrice currentPrice.timestamp",
              currentPrice.timestamp,
              "lastPrice.timestamp",
              lastPrice.timestamp
            );
            if (!time || (time && time < currentPrice.time)) {
              // Ищем последнее действие с ценой
              const prevPriceAction = await getTraderActionByKeys({
                PartitionKey: taskId,
                RowKey: PRICE
              });
              // Если действие с ценой есть в очереди
              // и дата цены больше, чем текущая цена
              if (prevPriceAction && prevPriceAction.time > currentPrice.time)
                return; // выходим

              // Сохраняем действие трейдеру
              await saveTraderAction({
                PartitionKey: taskId,
                RowKey: PRICE,
                id: uuid(),
                type: PRICE,
                actionTime: currentPrice.time,
                data: {
                  price: currentPrice.price,
                  time: currentPrice.time,
                  timestamp: currentPrice.timestamp,
                  tickId: currentPrice.tickId,
                  candleId: currentPrice.candleId,
                  source: currentPrice.source
                }
              });
            }
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.TRADER_PRICES_EVENTS_ERROR,
                cause: e,
                info: { taskId, lastPrice, currentPrice }
              },
              `Failed to save price action for trader ${taskId}`
            );
            Log.exception(error);
          }
        })
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_PRICES_EVENTS_ERROR,
        cause: e,
        info: { currentPrice }
      },
      "Failed to handle Price Event"
    );
  }
}

async function handleTick(eventData) {
  const {
    exchange,
    asset,
    currency,
    time,
    timestamp,
    price,
    tradeId
  } = eventData;
  try {
    const currentPrice = {
      exchange,
      asset,
      currency,
      time,
      timestamp,
      price,
      tickId: tradeId,
      candleId: null,
      source: "tick"
    };
    await handlePrice(currentPrice);
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_TICKS_EVENTS_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to handle Tick Event"
    );
  }
}

async function handleCandle(eventData) {
  const {
    type,
    exchange,
    asset,
    currency,
    time,
    timestamp,
    close,
    id,
    timeframe
  } = eventData;
  try {
    /* Если свеча сгенерирована по предыдущим данным - пропускаем */
    if (type === CANDLE_PREVIOUS || timeframe !== 1) return;
    const currentPrice = {
      exchange,
      asset,
      currency,
      time,
      timestamp,
      price: close,
      tickId: null,
      candleId: id,
      source: "candle"
    };
    await handlePrice(currentPrice);
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_CANDLES_EVENTS_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to handle Candle Event"
    );
  }
}

export { handleCandle, handleTick };

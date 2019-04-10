import * as df from "durable-functions";
import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import { CANDLE_PREVIOUS, createTraderSlug } from "cpz/config/state";
import { getActiveTradersBySlug } from "cpz/tableStorage-client/control/traders";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { INTERNAL } from "../config";

const {
  actions: { PRICE },
  status: { READY },
  events: { TRADER_ACTION }
} = INTERNAL;

async function handlePrice(context, currentPrice) {
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
      const client = df.getClient(context);
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
              const status = await client.getStatus(taskId);
              Log.warn(status.runtimeStatus, status.customStatus);
              if (status) {
                // TODO: save price action only if timestamp greater
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
                if (status.customStatus === READY) {
                  await client.raiseEvent(taskId, TRADER_ACTION);
                }
              } else {
                Log.error(`Trader "${taskId}" not started`);
              }
            }
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.TRADER_PRICES_EVENTS_ERROR,
                cause: e,
                info: { taskId, lastPrice, currentPrice }
              },
              "Failed to handle Price Event"
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

async function handleTick(context, eventData) {
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
    await handlePrice(context, currentPrice);
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

async function handleCandle(context, eventData) {
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
    await handlePrice(context, currentPrice);
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

import * as df from "durable-functions";
import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import { CANDLE_PREVIOUS, createTraderSlug } from "cpz/config/state";
import dayjs from "cpz/utils/lib/dayjs";
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
    Log.warn("traders", traders);
    if (traders && traders.length > 0) {
      const client = df.getClient(context);
      await Promise.all(
        traders.map(async ({ taskId, lastPrice }) => {
          try {
            const { time } = lastPrice;
            if (!time || (time && time < currentPrice.time)) {
              const status = await client.getStatus(taskId);
              if (status && status.runtimeStatus === "Running") {
                const action = {
                  id: uuid(),
                  type: PRICE,
                  data: {
                    price: currentPrice.price,
                    time: currentPrice.time,
                    timestamp: currentPrice.timestamp,
                    tickId: currentPrice.tickId,
                    candleId: currentPrice.candleId,
                    source: currentPrice.source
                  }
                };
                if (status.customStatus === READY) {
                  await client.raiseEvent(taskId, TRADER_ACTION, action);
                } else {
                  // TODO: save price action only if timestamp greater
                  await saveTraderAction({
                    PartitionKey: taskId,
                    RowKey: PRICE,
                    createdAt: dayjs.utc().toISOString(),
                    ...action
                  });
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
    Log.debug("handleTick", eventData);
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
    Log.debug("handleCandle", eventData);
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

import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import { generateKey } from "cpz/utils/helpers";
import { createTraderSlug } from "cpz/config/state";
import dayjs from "cpz/utils/lib/dayjs";
import { getTradersReadyForSignals } from "cpz/tableStorage-client/control/traders";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { SIGNAL } from "../config";

async function handleSignal(eventData) {
  try {
    const { exchange, asset, currency, robotId, timestamp } = eventData;
    const traders = await getTradersReadyForSignals({
      slug: createTraderSlug({
        exchange,
        asset,
        currency
      }),
      robotId
    });
    Log.warn("handleSignal", traders);
    if (traders && traders.length > 0) {
      await Promise.all(
        traders.map(async ({ taskId }) => {
          try {
            await saveTraderAction({
              PartitionKey: taskId,
              RowKey: generateKey(),
              id: uuid(),
              type: SIGNAL,
              actionTime: dayjs.utc(timestamp).valueOf(),
              data: eventData
            });
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.TRADER_HANDLE_PRICE_ERROR,
                cause: e,
                info: { ...eventData, taskId }
              },
              `Failed to save signal action for trader ${taskId}`
            );
            Log.exception(error);
          }
        })
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_HANDLE_PRICE_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to handle Signal Event"
    );
  }
}

export default handleSignal;

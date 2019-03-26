import * as df from "durable-functions";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import { generateKey } from "cpz/utils/helpers";
import { createTraderSlug } from "cpz/config/state";
import dayjs from "cpz/utils/lib/dayjs";
import { getActiveTradersBySlugAndRobotId } from "cpz/tableStorage-client/control/traders";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { INTERNAL } from "../config";

const {
  actions: { SIGNAL },
  status: { READY },
  events: { TRADER_ACTION }
} = INTERNAL;

async function handleSignal(context, eventData) {
  try {
    Log.debug("handleSignal", eventData);
    const { exchange, asset, currency, robotId } = eventData;
    const traders = await getActiveTradersBySlugAndRobotId({
      slug: createTraderSlug({
        exchange,
        asset,
        currency
      }),
      robotId
    });

    if (traders && traders.length > 0) {
      const client = df.getClient(context);
      await Promise.all(
        traders.map(async ({ taskId }) => {
          const action = { type: SIGNAL, data: eventData };
          const status = await client.getStatus(taskId);
          if (status && status.runtimeStatus === "Running") {
            if (status.customStatus === READY) {
              await client.raiseEvent(taskId, TRADER_ACTION, action);
            } else {
              await saveTraderAction({
                PartitionKey: taskId,
                RowKey: generateKey(),
                createdAt: dayjs.utc().toISOString(),
                ...action
              });
            }
          } else {
            Log.error(`Trader "${taskId}" not started`);
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
      "Failed to handle Tick Event"
    );
  }
}

export default handleSignal;

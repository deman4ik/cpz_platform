import * as df from "durable-functions";
import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import { generateKey } from "cpz/utils/helpers";
import { createTraderSlug } from "cpz/config/state";
import dayjs from "cpz/utils/lib/dayjs";
import { getStartedTradersBySlugAndRobotId } from "cpz/tableStorage-client/control/traders";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { INTERNAL } from "../config";

const {
  actions: { SIGNAL },
  status: { READY },
  events: { TRADER_ACTION }
} = INTERNAL;

async function handleSignal(context, eventData) {
  try {
    const { exchange, asset, currency, robotId } = eventData;
    const traders = await getStartedTradersBySlugAndRobotId({
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
          const status = await client.getStatus(taskId);
          Log.warn(status.runtimeStatus, status.customStatus);
          if (status) {
            await saveTraderAction({
              PartitionKey: taskId,
              RowKey: generateKey(),
              id: uuid(),
              type: SIGNAL,
              actionTime: dayjs.utc(eventData.timestamp).valueOf(),
              data: eventData
            });
            if (status.customStatus === READY) {
              await client.raiseEvent(taskId, TRADER_ACTION);
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
      "Failed to handle Signal Event"
    );
  }
}

export default handleSignal;

import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import EventGrid from "cpz/events";
import { TASKS_TRADER_RUN_EVENT } from "cpz/events/types/tasks/trader";
import { createTraderSlug } from "cpz/config/state";
import dayjs from "cpz/utils/dayjs";
import { getTradersReadyForSignals } from "cpz/tableStorage-client/control/traders";
import { saveTraderAction } from "cpz/tableStorage-client/control/traderActions";
import { SIGNAL } from "../config";
import { isUnlocked } from "../executors";

async function handleSignal(eventData) {
  try {
    const {
      exchange,
      asset,
      currency,
      robotId,
      timestamp,
      position: { prefix },
      action
    } = eventData;
    const traders = await getTradersReadyForSignals({
      slug: createTraderSlug({
        exchange,
        asset,
        currency
      }),
      robotId
    });
    if (traders && traders.length > 0) {
      const actionKey = `${prefix}_${action}`;
      await Promise.all(
        traders.map(async ({ taskId }) => {
          try {
            await saveTraderAction({
              PartitionKey: taskId,
              RowKey: actionKey,
              id: uuid(),
              type: SIGNAL,
              actionTime: dayjs.utc(timestamp).valueOf(),
              data: eventData
            });
            const unlocked = await isUnlocked(taskId);
            if (unlocked) {
              await EventGrid.publish(TASKS_TRADER_RUN_EVENT, {
                subject: taskId,
                data: { taskId }
              });
            }
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

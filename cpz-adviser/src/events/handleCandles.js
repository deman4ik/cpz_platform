import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import { CANDLE_PREVIOUS, createAdviserSlug } from "cpz/config/state";
import dayjs from "cpz/utils/dayjs";
import EventGrid from "cpz/events";
import { TASKS_ADVISER_RUN_EVENT } from "cpz/events/types/tasks/adviser";
import { getActiveAdvisersBySlug } from "cpz/tableStorage-client/control/advisers";
import { saveAdviserAction } from "cpz/tableStorage-client/control/adviserActions";
import { CANDLE } from "../config";
import { isUnlocked } from "../executors";

async function handleCandle(eventData) {
  try {
    const { exchange, asset, currency, timeframe, timestamp, type } = eventData;
    if (type === CANDLE_PREVIOUS) return;
    const advisers = await getActiveAdvisersBySlug(
      createAdviserSlug({
        exchange,
        asset,
        currency,
        timeframe
      })
    );
    if (advisers && advisers.length > 0) {
      await Promise.all(
        advisers.map(async ({ taskId }) => {
          try {
            await saveAdviserAction({
              PartitionKey: taskId,
              RowKey: CANDLE,
              id: uuid(),
              type: CANDLE,
              actionTime: dayjs.utc(timestamp).valueOf(),
              data: eventData
            });
            const unlocked = await isUnlocked(taskId);
            if (unlocked) {
              await EventGrid.publish(TASKS_ADVISER_RUN_EVENT, {
                subject: taskId,
                data: { taskId }
              });
            }
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.ADVISER_HANDLE_CANDLE_ERROR,
                cause: e,
                info: { ...eventData, taskId }
              },
              `Failed to save candle action for adviser ${taskId}`
            );
            Log.exception(error);
          }
        })
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.ADVISER_HANDLE_CANDLE_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to handle Adviser Event"
    );
  }
}

export default handleCandle;

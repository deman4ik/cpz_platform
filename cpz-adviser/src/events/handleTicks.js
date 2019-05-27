import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import dayjs from "cpz/utils/dayjs";
import EventGrid from "cpz/events";
import { TASKS_ADVISER_RUN_EVENT } from "cpz/events/types/tasks/adviser";
import { getStartedAdvisersWithActions } from "cpz/tableStorage-client/control/advisers";
import { saveAdviserAction } from "cpz/tableStorage-client/control/adviserActions";
import { TICK } from "../config";
import { isUnlocked } from "../executors";

async function handleTick(eventData) {
  try {
    const { exchange, asset, currency, timestamp } = eventData;
    const advisers = await getStartedAdvisersWithActions({
      exchange,
      asset,
      currency
    });
    if (advisers && advisers.length > 0) {
      await Promise.all(
        advisers.map(async ({ taskId }) => {
          try {
            await saveAdviserAction({
              PartitionKey: taskId,
              RowKey: TICK,
              id: uuid(),
              type: TICK,
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
                name: ServiceError.types.ADVISER_HANDLE_TICK_ERROR,
                cause: e,
                info: { ...eventData, taskId }
              },
              `Failed to save tick action for adviser ${taskId}`
            );
            Log.exception(error);
          }
        })
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.ADVISER_HANDLE_TICK_ERROR,
        cause: e,
        info: { ...eventData }
      },
      "Failed to handle Adviser Event"
    );
  }
}

export default handleTick;

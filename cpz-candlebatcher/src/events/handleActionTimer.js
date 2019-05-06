import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import dayjs from "cpz/utils/dayjs";
import { getStartedCandlebatchers } from "cpz/tableStorage-client/control/candlebatchers";
import { saveCandlebatcherAction } from "cpz/tableStorage-client/control/candlebatcherActions";
import { TASKS_CANDLEBATCHER_RUN_EVENT } from "cpz/events/types/tasks/candlebatcher";
import { isUnlocked } from "../executors";
import { RUN } from "../config";

async function handleActionTimer() {
  try {
    const candlebatchers = await getStartedCandlebatchers();

    if (candlebatchers && candlebatchers.length > 0) {
      await Promise.all(
        candlebatchers.map(async ({ taskId }) => {
          try {
            await saveCandlebatcherAction({
              PartitionKey: taskId,
              RowKey: RUN,
              id: uuid(),
              type: RUN,
              actionTime: dayjs.utc().valueOf()
            });
            const unlocked = await isUnlocked(taskId);
            if (unlocked)
              await EventGrid.publish(TASKS_CANDLEBATCHER_RUN_EVENT, {
                subject: taskId,
                data: { taskId }
              });
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.CANDLEBATCHER_ACTION_TIMER_ERROR,
                cause: e,
                info: { taskId }
              },
              `Failed to send run event for candlebatcher ${taskId}`
            );
            Log.exception(error);
          }
        })
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_ACTION_TIMER_ERROR,
        cause: e
      },
      "Failed to handle timer"
    );
  }
}

export default handleActionTimer;

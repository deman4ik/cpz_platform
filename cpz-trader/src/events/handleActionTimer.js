import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import { TASKS_TRADER_RUN_EVENT } from "cpz/events/types/tasks/trader";
import { getStartedTraders } from "cpz/tableStorage-client/control/traders";
import { traderHasActions } from "cpz/tableStorage-client/control/traderActions";

async function handleActionTimer() {
  try {
    const traders = await getStartedTraders();

    if (traders && traders.length > 0) {
      await Promise.all(
        traders.map(async ({ taskId }) => {
          try {
            const hasActions = await traderHasActions(taskId);

            if (hasActions) {
              await EventGrid.publish(TASKS_TRADER_RUN_EVENT, {
                subject: taskId,
                data: { taskId }
              });
            }
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.TRADER_ACTION_TIMER_ERROR,
                cause: e,
                info: { taskId }
              },
              `Failed to send run event for trader ${taskId}`
            );
            Log.exception(error);
          }
        })
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.TRADER_ACTION_TIMER_ERROR,
        cause: e
      },
      "Failed to handle timer"
    );
  }
}

export default handleActionTimer;

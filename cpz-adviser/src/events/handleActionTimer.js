import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import { TASKS_ADVISER_RUN_EVENT } from "cpz/events/types/tasks/adviser";
import { getStartedAdvisers } from "cpz/tableStorage-client/control/advisers";
import { adviserHasActions } from "cpz/tableStorage-client/control/adviserActions";

async function handleActionTimer() {
  try {
    const advisers = await getStartedAdvisers();

    if (advisers && advisers.length > 0) {
      await Promise.all(
        advisers.map(async ({ taskId }) => {
          try {
            const hasActions = await adviserHasActions(taskId);

            if (hasActions) {
              await EventGrid.publish(TASKS_ADVISER_RUN_EVENT, {
                subject: taskId,
                data: { taskId }
              });
            }
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.ADVISER_TIMER_ERROR,
                cause: e,
                info: { taskId }
              },
              `Failed to send run event for adviser ${taskId}`
            );
            Log.exception(error);
          }
        })
      );
    }
  } catch (e) {
    throw new ServiceError(
      {
        name: ServiceError.types.ADVISER_TIMER_ERROR,
        cause: e
      },
      "Failed to handle timer"
    );
  }
}

export default handleActionTimer;

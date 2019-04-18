import Log from "cpz/log";
import ServiceError from "cpz/error";
import {
  getNextCandlebatcherAction,
  deleteCandlebatcherAction
} from "cpz/tableStorage-client/control/candlebatcherActions";

async function loadAction(taskId, lastAction) {
  try {
    let nextAction;
    let loaded = false;
    /* eslint-disable no-await-in-loop */
    while (!loaded) {
      nextAction = await getNextCandlebatcherAction(taskId);

      loaded = true;
      // Если есть следующее действие
      if (nextAction) {
        const locked = await deleteCandlebatcherAction(nextAction);
        // Если есть предыдущее действие и id действий равны
        if (!locked || (lastAction && lastAction.actionId === nextAction.id)) {
          // грузим заново
          loaded = false;
          Log.warn("Action '%s' have already been processed", nextAction.id);
        }
      }
    }
    /* no-await-in-loop */
    return nextAction;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_LOAD_ACTIONS_ERROR,
        cause: e,
        info: {
          taskId,
          lastAction
        }
      },
      "Failed to load candlebatcher action"
    );
    Log.exception(error);
    Log.clearContext();
    throw error;
  }
}

export default loadAction;

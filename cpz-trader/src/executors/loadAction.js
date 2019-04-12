import Log from "cpz/log";
import ServiceError from "cpz/error";
import {
  getNextTraderAction,
  deleteTraderAction
} from "cpz/tableStorage-client/control/traderActions";

async function loadAction(taskId, lastAction) {
  try {
    let nextAction;
    let loaded = false;
    /* eslint-disable no-await-in-loop */
    while (!loaded) {
      nextAction = await getNextTraderAction(taskId);

      loaded = true;
      // Если есть следующее действие
      if (nextAction) {
        const lock = await deleteTraderAction(nextAction);
        // Если есть предыдущее действие и id действий равны
        if (!lock || (lastAction && lastAction.actionId === nextAction.id)) {
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
        name: ServiceError.types.TRADER_LOAD_ACTIONS_ERROR,
        cause: e,
        info: {
          taskId,
          lastAction
        }
      },
      "Failed to load trader action"
    );
    Log.exception(error);
    Log.clearContext();
    throw error;
  }
}

export default loadAction;

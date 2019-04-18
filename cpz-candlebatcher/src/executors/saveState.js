import ServiceError from "cpz/error";
import {
  saveCandlebatcherState,
  updateCandlebatcherState
} from "cpz/tableStorage-client/control/candlebatchers";
import { candlebatcherStateToCommonProps } from "../utils/helpers";

async function saveState(state, update = false) {
  try {
    if (update) {
      return await updateCandlebatcherState(state);
    }
    await saveCandlebatcherState(state);
    return true;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_SAVE_STATE_ERROR,
        cause: e,
        info: {
          ...candlebatcherStateToCommonProps(state)
        }
      },
      "Failed to save Candlebatcher state"
    );
    throw error;
  }
}

export default saveState;

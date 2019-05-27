import ServiceError from "cpz/error";
import {
  saveAdviserState,
  updateAdviserState
} from "cpz/tableStorage-client/control/advisers";
import { adviserStateToCommonProps } from "../utils/helpers";

async function saveState(state, update = false) {
  try {
    if (update) {
      return await updateAdviserState(state);
    }
    await saveAdviserState(state);
    return true;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_SAVE_STATE_ERROR,
        cause: e,
        info: {
          ...adviserStateToCommonProps(state)
        }
      },
      "Failed to save Adviser state"
    );
    throw error;
  }
}

export default saveState;

import ServiceError from "cpz/error";
import {
  saveTraderState,
  updateTraderState
} from "cpz/tableStorage-client/control/traders";
import { traderStateToCommonProps } from "../utils/helpers";

async function saveState(state, update = false) {
  try {
    if (update) {
      return await updateTraderState(state);
    }
    await saveTraderState(state);
    return true;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.TRADER_SAVE_STATE_ERROR,
        cause: e,
        info: {
          ...traderStateToCommonProps(state)
        }
      },
      "Failed to save Trader state"
    );
    throw error;
  }
}

export default saveState;

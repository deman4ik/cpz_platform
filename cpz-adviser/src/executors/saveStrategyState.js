import ServiceError from "cpz/error";
import Log from "cpz/log";
import BlobStorageClient from "cpz/blobStorage";
import { STRATEGY_STATE } from "cpz/blobStorage/containers";
import { adviserStateToCommonProps } from "../utils/helpers";

async function saveStrategyState(state, strategyState) {
  Log.debug(`saveStrategyState`);
  try {
    const { robotId } = state;
    await BlobStorageClient.upload(
      STRATEGY_STATE,
      `${robotId}.json`,
      JSON.stringify(strategyState)
    );
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_SAVE_STRATEGY_STATE_ERROR,
        cause: e,
        info: {
          ...adviserStateToCommonProps(state)
        }
      },
      `Failed to save strategy state`
    );
    throw error;
  }
}

export default saveStrategyState;

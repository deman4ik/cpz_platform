import ServiceError from "cpz/error";
import BlobStorageClient from "cpz/blobStorage";
import { STRATEGY_STATE } from "cpz/blobStorage/containers";
import { adviserStateToCommonProps } from "../utils/helpers";

async function loadStrategyState(state) {
  try {
    const { robotId } = state;
    const strategyState = await BlobStorageClient.download(
      STRATEGY_STATE,
      `${robotId}.json`
    );
    return JSON.parse(strategyState);
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_LOAD_STRATEGY_STATE_ERROR,
        cause: e,
        info: {
          ...adviserStateToCommonProps(state)
        }
      },
      `Failed to load strategy state`
    );
    throw error;
  }
}

export default loadStrategyState;

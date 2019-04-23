import ServiceError from "cpz/error";
import Log from "cpz/log";
import BlobStorageClient from "cpz/blobStorage";
import { INDICATORS_STATE } from "cpz/blobStorage/containers";
import { adviserStateToCommonProps } from "../utils/helpers";

async function saveIndicatorsState(state, indicatorsState) {
  Log.debug(`saveIndicatorsState`);
  try {
    const { robotId } = state;
    await BlobStorageClient.upload(
      INDICATORS_STATE,
      `${robotId}.json`,
      JSON.stringify(indicatorsState)
    );
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_SAVE_INDICATORS_STATE_ERROR,
        cause: e,
        info: {
          ...adviserStateToCommonProps(state)
        }
      },
      `Failed to save indicators state`
    );
    throw error;
  }
}

export default saveIndicatorsState;

import ServiceError from "cpz/error";
import Log from "cpz/log";
import BlobStorageClient from "cpz/blobStorage";
import { INDICATORS_STATE } from "cpz/blobStorage/containers";
import { adviserStateToCommonProps } from "../utils/helpers";

async function loadIndicatorsState(state) {
  Log.debug(`loadIndicatorsState`);
  try {
    const { robotId } = state;
    const indicatorsState = await BlobStorageClient.download(
      INDICATORS_STATE,
      `${robotId}.json`
    );
    return JSON.parse(indicatorsState);
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_LOAD_INDICATORS_STATE_ERROR,
        cause: e,
        info: {
          ...adviserStateToCommonProps(state)
        }
      },
      `Failed to load indicators state`
    );
    throw error;
  }
}

export default loadIndicatorsState;

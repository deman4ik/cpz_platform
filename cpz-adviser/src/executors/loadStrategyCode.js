import ServiceError from "cpz/error";
import Log from "cpz/log";
import BlobStorageClient from "cpz/blobStorage";
import { STRATEGY_CODE } from "cpz/blobStorage/containers";
import requireFromString from "cpz/require";
import { adviserStateToCommonProps } from "../utils/helpers";

async function loadStrategyCode(state) {
  Log.debug(`loadStrategyCode`);
  try {
    const { strategyName } = state;
    const code = await BlobStorageClient.download(
      STRATEGY_CODE,
      `${strategyName}.js`
    );
    const strategyObject = requireFromString(code);
    return strategyObject;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_LOAD_STRATEGY_ERROR,
        cause: e,
        info: {
          ...adviserStateToCommonProps(state)
        }
      },
      `Failed to load strategy code`
    );
    throw error;
  }
}

export default loadStrategyCode;

import ServiceError from "cpz/error";
import BlobStorageClient from "cpz/blobStorage";
import { INDICATORS_CODE } from "cpz/blobStorage/containers";
import requireFromString from "cpz/require";
import { adviserStateToCommonProps } from "../utils/helpers";

async function loadBaseIndicatorCode(state, fileName) {
  try {
    const code = await BlobStorageClient.download(
      INDICATORS_CODE,
      `${fileName}.js`
    );

    const indicatorObject = requireFromString(code);

    return { fileName, code: indicatorObject };
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_LOAD_INDICATOR_ERROR,
        cause: e,
        info: {
          ...adviserStateToCommonProps(state)
        }
      },
      `Failed to load indicator`
    );
    throw error;
  }
}

async function loadBaseIndicatorsCode(state, indicators) {
  try {
    const result = await Promise.all(
      indicators.map(fileName => loadBaseIndicatorCode(state, fileName))
    );

    return result;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_LOAD_INDICATORS_ERROR,
        cause: e,
        info: {
          ...adviserStateToCommonProps(state)
        }
      },
      `Failed to load indicators`
    );
    throw error;
  }
}

export default loadBaseIndicatorsCode;

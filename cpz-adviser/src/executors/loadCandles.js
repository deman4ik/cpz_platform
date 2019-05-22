import ServiceError from "cpz/error";
import Log from "cpz/log";
import { createCachedCandleSlug } from "cpz/config/state";
import { getCachedCandlesByKey } from "cpz/tableStorage-client/market/candles";
import { adviserStateToCommonProps } from "../utils/helpers";

async function loadCandles(state) {
  Log.debug(`loadCandles`);
  try {
    const {
      exchange,
      asset,
      currency,
      timeframe,
      settings: { requiredHistoryMaxBars }
    } = state;
    const result = await getCachedCandlesByKey(
      createCachedCandleSlug({
        exchange,
        asset,
        currency,
        timeframe
      }),
      requiredHistoryMaxBars
    );

    if (result && result.length > 0) return result.reverse();
    return [];
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_LOAD_CANDLES_ERROR,
        cause: e,
        info: {
          ...adviserStateToCommonProps(state)
        }
      },
      `Failed to load cached candles`
    );
    Log.error(error);
    return [];
  }
}

export default loadCandles;

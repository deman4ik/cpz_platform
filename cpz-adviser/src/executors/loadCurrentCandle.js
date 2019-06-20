import ServiceError from "cpz/error";
import Log from "cpz/log";
import dayjs from "cpz/utils/dayjs";
import { createCachedCandleSlug } from "cpz/config/state";
import { getCurrentCandle } from "cpz/tableStorage-client/market/candles";
import { currentCandleEX } from "cpz/connector-client/candles";

async function loadCurrentCandle(state) {
  try {
    const { exchange, asset, currency, timeframe } = state;
    let storageCandle = null;
    let exCandle = null;
    storageCandle = await getCurrentCandle(
      createCachedCandleSlug({
        exchange,
        asset,
        currency,
        timeframe
      })
    );

    if (
      !storageCandle ||
      dayjs.utc(storageCandle.Timestamp).valueOf() <
        dayjs.utc().add(-1, "minute")
    ) {
      exCandle = await currentCandleEX({
        exchange,
        asset,
        currency,
        timeframe
      });
    }
    return exCandle || storageCandle;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.ADVISER_LOAD_CANDLES_ERROR,
        cause: e,
        info: {
          ...state
        }
      },
      `Failed to load cached candles`
    );
    Log.error(error);
    return null;
  }
}

export default loadCurrentCandle;

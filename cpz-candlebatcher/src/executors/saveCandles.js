import Log from "cpz/log";
import ServiceError from "cpz/error";
import { saveCandleToCache } from "cpz/tableStorage-client/market/candles";
import { candlebatcherStateToCommonProps } from "../utils/helpers";

async function saveCandlesToCache(state, candles) {
  try {
    await Promise.all(
      candles.map(async candle => {
        try {
          await saveCandleToCache(candle);
        } catch (e) {
          const error = new ServiceError(
            {
              name: ServiceError.types.CANDLEBATCHER_SAVE_CANDLE_ERROR,
              cause: e,
              info: {
                ...candlebatcherStateToCommonProps(state),
                ...candle
              }
            },
            "Failed to save candles to cache"
          );
          Log.exception(error);
        }
      })
    );
    return true;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_SAVE_CANDLES_ERROR,
        cause: e,
        info: {
          ...candlebatcherStateToCommonProps(state)
        }
      },
      "Failed to save candles to cache"
    );
    Log.exception(error);
    // TODO: Publish error event
    return false;
  }
}

export default saveCandlesToCache;

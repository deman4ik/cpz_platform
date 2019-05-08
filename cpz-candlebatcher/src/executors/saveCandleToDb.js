import Log from "cpz/log";
import ServiceError from "cpz/error";
import { saveCandlesDB } from "cpz/db-client/candles";

async function saveCandlesToDb(state, candlesObject) {
  try {
    await Promise.all(
      Object.keys(candlesObject).map(async timeframe => {
        try {
          await saveCandlesDB({
            timeframe,
            candles: [candlesObject[timeframe]]
          });
        } catch (e) {
          const error = new ServiceError(
            {
              name: ServiceError.types.CANDLEBATCHER_SAVE_CANDLE_ERROR,
              cause: e,
              info: {
                ...state
              }
            },
            "Failed to save candles to db"
          );
          Log.exception(error);
        }
      })
    );
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_SAVE_CANDLES_ERROR,
        cause: e,
        info: {
          ...state
        }
      },
      "Failed to save candles to db"
    );
    Log.exception(error);
    // TODO: Publish error event
  }
}

export default saveCandlesToDb;

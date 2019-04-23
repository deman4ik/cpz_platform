import Log from "cpz/log";
import ServiceError from "cpz/error";
import dayjs from "cpz/utils/lib/dayjs";
import { createCachedCandleSlug } from "cpz/config/state";
import { cleanCachedCandles } from "cpz/tableStorage-client/market/candles";
import { timeframeToTimeUnit } from "cpz/utils/candlesUtils";
import { candlebatcherStateToCommonProps } from "../utils/helpers";

async function cleanCandles(state) {
  try {
    const { exchange, asset, currency, timeframes, settings } = state;

    await Promise.all(
      timeframes.map(async timeframe => {
        const { number, unit } = timeframeToTimeUnit(
          settings.requiredHistoryMaxBars * 2,
          timeframe
        );

        Log.debug(
          "Cleaning cached candles",
          createCachedCandleSlug({
            exchange,
            asset,
            currency,
            timeframe
          }),
          "to",
          dayjs
            .utc()
            .add(-number, unit)
            .toISOString()
        );
        await cleanCachedCandles({
          slug: createCachedCandleSlug({
            exchange,
            asset,
            currency,
            timeframe
          }),
          dateTo: dayjs.utc().add(-number, unit)
        });
      })
    );

    return true;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_CLEAN_CACHED_CANDLES_ERROR,
        cause: e,
        info: {
          ...candlebatcherStateToCommonProps(state)
        }
      },
      "Failed to clean cached candles"
    );
    Log.exception(error);
    return false;
  }
}

export default cleanCandles;

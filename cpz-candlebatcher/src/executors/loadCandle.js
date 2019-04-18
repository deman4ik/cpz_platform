import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import { CANDLE_LOADED, createCachedCandleSlug } from "cpz/config/state";
import { generateCandleRowKey } from "cpz/utils/candlesUtils";
import { lastMinuteCandleEX } from "cpz/connector-client/candles";
import { candlebatcherStateToCommonProps } from "../utils/helpers";

async function loadCandle(state) {
  try {
    const { exchange, proxy, asset, currency, taskId } = state;
    // Вызов функции коннектора
    const result = await lastMinuteCandleEX({
      exchange,
      proxy,
      asset,
      currency
    });

    if (!result) throw new Error("No candle data.");
    // Сохраняем новую загруженную свечу
    return {
      ...result,
      id: uuid(),
      PartitionKey: createCachedCandleSlug({
        exchange,
        asset,
        currency,
        timeframe: 1
      }),
      RowKey: generateCandleRowKey(result.time),
      taskId,
      type: CANDLE_LOADED
    };
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_LOAD_CANDLE_ERROR,
        cause: e,
        info: {
          ...candlebatcherStateToCommonProps(state)
        }
      },
      `Failed to load candle`
    );
    Log.error(error);
    return null;
  }
}

export default loadCandle;

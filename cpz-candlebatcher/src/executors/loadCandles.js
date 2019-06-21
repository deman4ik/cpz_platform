import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import { CANDLE_LOADED, createCachedCandleSlug } from "cpz/config/state";
import { generateCandleRowKey } from "cpz/utils/candlesUtils";
import { minuteCandlesEX } from "cpz/connector-client/candles";
import { candlebatcherStateToCommonProps } from "../utils/helpers";

async function loadCandles(state, loadFrom) {
  try {
    const { exchange, proxy, asset, currency, taskId } = state;
    // Вызов функции коннектора
    const candles = await minuteCandlesEX({
      exchange,
      proxy,
      asset,
      currency,
      date: loadFrom
    });

    if (candles.length === 0) return [];
    // Сохраняем новую загруженную свечу
    return candles.map(candle => ({
      ...candle,
      id: uuid(),
      PartitionKey: createCachedCandleSlug({
        exchange,
        asset,
        currency,
        timeframe: 1
      }),
      RowKey: generateCandleRowKey(candle.time),
      taskId,
      type: CANDLE_LOADED
    }));
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_LOAD_CANDLES_ERROR,
        cause: e,
        info: {
          ...candlebatcherStateToCommonProps(state),
          loadFrom
        }
      },
      `Failed to load candles`
    );
    Log.error(error);
    return null;
  }
}

export default loadCandles;

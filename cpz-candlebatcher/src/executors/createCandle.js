import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import {
  CANDLE_CREATED,
  createCachedTickSlug,
  createCachedCandleSlug
} from "cpz/config/state";
import { getPrevCachedTicks } from "cpz/tableStorage-client/market/ticks";
import { generateCandleRowKey } from "cpz/utils/candlesUtils";
import { sortAsc } from "cpz/utils/helpers";
import { candlebatcherStateToCommonProps } from "../utils/helpers";

async function createCandle(state) {
  try {
    const { exchange, asset, currency, taskId, dateFrom, dateTo } = state;

    /* Считывание тиков за предыдущую минуту */
    let ticks = await getPrevCachedTicks({
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      slug: createCachedTickSlug(exchange, asset, currency)
    });
    /* Если были тики */
    if (ticks.length > 0) {
      /* Сортируем тики по дате */
      ticks = ticks.sort((a, b) => sortAsc(a.time, b.time));
      /* Формируем свечу */
      return {
        PartitionKey: createCachedCandleSlug({
          exchange,
          asset,
          currency,
          timeframe: 1
        }),
        RowKey: generateCandleRowKey(dateFrom.valueOf()),
        id: uuid(),
        taskId,
        exchange,
        asset,
        currency,
        timeframe: 1,
        time: dateFrom.valueOf(), // время в милисекундах
        timestamp: dateFrom.toISOString(), // время в ISO UTC
        open: +ticks[0].price, // цена открытия - цена первого тика
        high: Math.max(...ticks.map(t => +t.price)), // максимальная цена тиков
        low: Math.min(...ticks.map(t => +t.price)), // минимальная цена тиков
        close: +ticks[ticks.length - 1].price, // цена закрытия - цена последнего тика
        volume: ticks.map(t => +t.volume).reduce((a, b) => a + b), // объем - сумма объема всех тиков
        type: CANDLE_CREATED // признак - свеча сформирована
      };
    }
    /* Если тиков не было - нельзя сформировать свечу */
    return null;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_CREATE_CANDLE_ERROR,
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

export default createCandle;

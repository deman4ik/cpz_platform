import { v4 as uuid } from "uuid";
import dayjs from "cpz/utils/lib/dayjs";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import {
  CANDLE_CREATED,
  CANDLE_PREVIOUS,
  createCachedCandleSlug
} from "cpz/config/state";
import {
  generateCandleRowKey,
  getCurrentTimeframes,
  handleCandleGaps
} from "cpz/utils/candlesUtils";
import {
  getCachedCandles,
  saveCandlesArrayToCache
} from "cpz/tableStorage-client/market/candles";
import { sortAsc } from "cpz/utils/helpers";
import { candlebatcherStateToCommonProps } from "../utils/helpers";

async function createTimeframeCandles(state, candle) {
  try {
    const {
      taskId,
      exchange,
      asset,
      currency,
      timeframes,
      currentDate,
      dateTo
    } = state;
    const timeframeCandles = {};
    timeframeCandles[1] = candle;
    /* Проверяем какие таймфреймы возможно сформировать */
    const currentTimeframes = getCurrentTimeframes(timeframes, currentDate);
    if (currentTimeframes.length > 0) {
      /* Загружаем максимальный период из кэша */
      const maxTimeframe = currentTimeframes[0];
      const loadDateFrom = currentDate
        .add(-maxTimeframe, "minute")
        .toISOString();
      /* Заполняем массив свечей - загруженные + текущая и сортируем по дате */
      let loadedCandles = await getCachedCandles({
        dateFrom: loadDateFrom,
        dateTo: dateTo.toISOString(),
        slug: createCachedCandleSlug({
          exchange,
          asset,
          currency,
          timeframe: 1
        })
      });
      /* Добаляем текущую свечу к загруженным */
      loadedCandles = [...loadedCandles, candle].sort((a, b) =>
        sortAsc(a.time, b.time)
      );
      if (loadedCandles.length !== maxTimeframe) {
        const gappedCandles = handleCandleGaps(
          {
            exchange,
            asset,
            currency,
            timeframe: 1,
            taskId
          },
          loadDateFrom,
          dateTo,
          maxTimeframe,
          loadedCandles
        );
        // Сохраняем сформированные пропущенные свечи
        if (gappedCandles.length > 0) {
          loadedCandles = loadedCandles
            .concat(gappedCandles)
            .sort((a, b) => sortAsc(a.time, b.time));
          await saveCandlesArrayToCache(gappedCandles);
        }
      }

      /* Полный массив свечей */
      const allCandles = loadedCandles;

      /* Формируем свечи в необходимых таймфреймах */
      currentTimeframes.forEach(timeframe => {
        const timeFrom = currentDate.add(-timeframe, "minute").valueOf();
        const timeTo = currentDate.valueOf();
        const candles = allCandles.filter(
          c => c.time >= timeFrom && c.time < timeTo
        );
        if (candles.length > 0) {
          timeframeCandles[timeframe] = {
            id: uuid(),
            PartitionKey: createCachedCandleSlug({
              exchange,
              asset,
              currency,
              timeframe
            }),
            RowKey: generateCandleRowKey(timeFrom),
            taskId,
            exchange,
            asset,
            currency,
            timeframe,
            time: timeFrom, // время в милисекундах
            timestamp: dayjs.utc(timeFrom).toISOString(), // время в ISO UTC
            open: +candles[0].open, // цена открытия - цена открытия первой свечи
            high: Math.max(...candles.map(t => +t.high)), // максимальная цена
            low: Math.min(...candles.map(t => +t.low)), // минимальная цена
            close: +candles[candles.length - 1].close, // цена закрытия - цена закрытия последней свечи
            volume: +candles.map(t => t.volume).reduce((a, b) => a + b), // объем - сумма объема всех свечей
            count: +candles.length,
            gap: candles.length !== timeframe,
            type:
              candles.filter(c => c.type === CANDLE_PREVIOUS).length ===
              timeframe
                ? CANDLE_PREVIOUS
                : CANDLE_CREATED
          };
        }
      });
    }

    return timeframeCandles;
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_CREATE_CANDLE_ERROR,
        cause: e,
        info: {
          ...candlebatcherStateToCommonProps(state)
        }
      },
      `Failed to create timeframe candles`
    );
    Log.error(error);
    return { 1: candle };
  }
}

export default createTimeframeCandles;

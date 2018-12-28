import { v4 as uuid } from "uuid";
import dayjs from "./lib/dayjs";
import {
  durationMinutes,
  arraysDiff,
  getInvertedTimestamp,
  sortDesc,
  sortAsc,
  filterOutNonUnique
} from "./helpers";
import { CANDLE_PREVIOUS, createCachedCandleSlug } from "../config/state";

/**
 * Отбор подходящих по времени таймфреймов для формирования
 *
 * @param {Array} timeframes
 * @param {dayjs} date
 */
function getCurrentTimeframes(timeframes, inputDate) {
  const date = dayjs(inputDate).utc();
  /* Количество часов 0-23 */
  const hour = date.hour();
  /* Количество минут 0-59 */
  const minute = date.minute();
  /* Инициализируем массив подходящих таймфреймов */
  let currentTimeframes = [];
  /* Проверяем все переданные таймфреймы */
  timeframes.forEach(timeframe => {
    /* Если одна минута */
    if (timeframe === 1) {
      /* Минимально возможный таймфрейм - пропускаем */
      return;
    }
    /* Если меньше часа */
    if (timeframe < 60) {
      /* Проверяем текущую минуту */
      if (minute % timeframe === 0) currentTimeframes.push(timeframe);
      /* В остальных случаях проверяем текущий час и минуту */
    } else if (hour % (timeframe / 60) === 0 && minute % timeframe === 0) {
      currentTimeframes.push(timeframe);
    }
  });
  /* Если есть хотя бы один подходящий таймфрейм */
  if (currentTimeframes.length > 0)
    /* Сортируем в порядке убывания */
    currentTimeframes = currentTimeframes.sort(sortDesc);
  /* Возвращаем массив доступных таймфреймов */
  return currentTimeframes;
}

function createMinutesList(dateFrom, dateTo, dur) {
  const duration = dur || durationMinutes(dateFrom, dateTo);
  const list = [];
  for (let i = 0; i < duration; i += 1) {
    list.push(
      dayjs(dateFrom)
        .add(i, "minute")
        .valueOf()
    );
  }
  return list;
}

/* Возвращает объект с массивом пачек дат исключая последнюю дату dateTo */
function chunkDates(dateFrom, dateTo, chunkSize) {
  const list = createMinutesList(dateFrom, dateTo);

  const arrayToChunk = [...list];
  const chunks = [];
  while (arrayToChunk.length) {
    const chunk = arrayToChunk.splice(0, chunkSize);
    chunks.push({
      dateFrom: dayjs(chunk[0]).utc(),
      dateTo: dayjs(chunk[chunk.length - 1]).utc(),
      duration: chunk.length - 1
    });
  }

  return { chunks, total: list.length - 1 };
}

function generateCandleRowKey(time) {
  return getInvertedTimestamp(time);
}

function handleCandleGaps(info, dateFrom, dateTo, maxDuration, inputCandles) {
  let candles = [...inputCandles];
  const { exchange, asset, currency, timeframe, taskId } = info;
  // Создаем список с полным количеством минут
  const fullMinutesList = [
    ...new Set(createMinutesList(dateFrom, dateTo, maxDuration))
  ];
  // Список загруженных минут
  const loadedMinutesList = [...new Set(candles.map(candle => candle.time))];
  // Ищем пропуски
  const diffs = arraysDiff(fullMinutesList, loadedMinutesList).sort(sortAsc);
  // Если есть пропуски
  if (diffs.length > 0) {
    const gappedCandles = [];
    // Для каждой пропущенный свечи
    diffs.forEach(diffTime => {
      // Время предыдущей свечи
      const previousTime = dayjs(diffTime)
        .utc()
        .add(-1, "minute")
        .valueOf();
      // Индекс предыдущей свечи
      const previousCandleIndex = candles.findIndex(
        candle => candle.time === previousTime
      );
      // Предыдущая свеча
      const previousCandle = candles[previousCandleIndex];
      if (previousCandle) {
        // Заполняем пропуск
        const gappedCandle = {
          PartitionKey: createCachedCandleSlug({
            exchange,
            asset,
            currency,
            timeframe
          }),
          RowKey: generateCandleRowKey(diffTime),
          id: uuid(),
          exchange,
          asset,
          currency,
          timeframe,
          taskId,
          time: diffTime, // время в милисекундах
          timestamp: dayjs(diffTime)
            .utc()
            .toISOString(), // время в ISO UTC
          open: previousCandle.close, // цена открытия = цене закрытия предыдущей
          high: previousCandle.close, // максимальная цена = цене закрытия предыдущей
          low: previousCandle.close, // минимальная цена = цене закрытия предыдущей
          close: previousCandle.close, // цена закрытия = цене закрытия предыдущей
          volume: 0, // нулевой объем
          type: CANDLE_PREVIOUS // признак - предыдущая
        };

        gappedCandles.push(gappedCandle);
        candles.push(gappedCandle);
        candles = candles.sort((a, b) => sortAsc(a.time, b.time));
      }
    });

    return gappedCandles;
  }
  return [];
}

function timeframeToTimeUnit(number, timeframe) {
  if (timeframe < 60) {
    return { number: number * timeframe, unit: "minute" };
  }
  if (timeframe < 1440) {
    return { number: number * (timeframe / 60), unit: "hour" };
  }
  return { number: number * (timeframe / 1440), unit: "day" };
}
export {
  getCurrentTimeframes,
  createMinutesList,
  chunkDates,
  handleCandleGaps,
  generateCandleRowKey,
  timeframeToTimeUnit
};

import { v4 as uuid } from "uuid";
import dayjs from "./lib/dayjs";
import {
  durationMinutes,
  arraysDiff,
  getInvertedTimestamp,
  sortDesc,
  sortAsc
} from "./helpers";
import { CANDLE_PREVIOUS, createCachedCandleSlug } from "../config/state";

/**
 * Отбор подходящих по времени таймфреймов
 *
 * @param {number[]} timeframes
 * @param {Date} inputDate
 * @returns {number[]}
 */
function getCurrentTimeframes(timeframes, inputDate) {
  const date = dayjs.utc(inputDate);
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

/**
 * Создание массива минут между указаннами датами
 * с указанной продолжительностью
 *
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @param {number} duration
 * @returns {number[]}
 */
function createMinutesList(
  dateFrom,
  dateTo,
  duration = durationMinutes(dateFrom, dateTo)
) {
  const list = [];
  for (let i = 0; i < duration; i += 1) {
    list.push(
      dayjs
        .utc(dateFrom)
        .add(i, "minute")
        .valueOf()
    );
  }
  return list;
}

/**
 * Создание массива минут (с указанием времени начала и конца минуты) между указаннами датами
 *
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @param {number} duration
 * @returns {Array}
 */
function createMinutesListWithRange(
  dateFrom,
  dateTo,
  duration = durationMinutes(dateFrom, dateTo)
) {
  const list = [];
  for (let i = 0; i < duration; i += 1) {
    const date = dayjs(dateFrom).add(i, "minute");
    list.push({
      dateFrom: date.valueOf(),
      dateTo: date.endOf("minute").valueOf()
    });
  }
  return list;
}

/**
 * Возвращает объект с массивом пачек дат между указаннами датами
 * (dateTo не включается)
 *
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @param {number} chunkSize
 */
function chunkDates(dateFrom, dateTo, chunkSize) {
  const list = createMinutesList(dateFrom, dateTo);

  const arrayToChunk = [...list];
  const chunks = [];
  while (arrayToChunk.length) {
    const chunk = arrayToChunk.splice(0, chunkSize);
    chunks.push({
      dateFrom: dayjs.utc(chunk[0]),
      dateTo: dayjs.utc(chunk[chunk.length - 1]),
      duration: chunk.length
    });
  }

  return { chunks, total: list.length };
}

/**
 * Генерация ID свечи по времени
 *
 * @param {number} time - время в милисекундах
 */
function generateCandleRowKey(time) {
  return getInvertedTimestamp(time);
}

/* TODO Описать детальнее handleCandleGaps
 * с примером аргументов и return
 */
/**
 * Заполнение пропусков свечей в исходном массиве,
 * путем создания новых свечей по данным предыдущей свечи
 *
 * @param {Object} info
 * @param {string} info.exchange код биржи
 * @param {string} info.asset базовая валюта
 * @param {string} info.currency котировка валюты
 * @param {number} info.timeframe таймфрейм в минутах
 * @param {string} info.taskId UUID сервиса
 * @param {Date} dateFrom дата с
 * @param {Date} dateTo дата по
 * @param {number} maxDuration количество минут
 * @param {[Object]} inputCandles массив свечей
 * @returns {[Object]} массив свечей с заполненными пропусками
 */
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
      const previousTime = dayjs
        .utc(diffTime)
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
          }), // Ключ раздела Azure Table Storage
          RowKey: generateCandleRowKey(diffTime), // Ключ строки Azure Table Storage
          id: uuid(), // Уникальный идентификтор свечи
          exchange, // код биржи
          asset, // базовая валюта
          currency, // котировка валюты
          timeframe, // таймфрейм в минутах
          taskId, // UUID сервиса
          time: diffTime, // время в милисекундах
          timestamp: dayjs.utc(diffTime).toISOString(), // время в ISO UTC
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

/**
 * Вычисление количества едениц времени в зависимости от таймфрейма
 *
 * @param {number} number количество единиц
 * @param {number} timeframe таймфрейм в минутах
 * @returns {Object}
 */
function timeframeToTimeUnit(number, timeframe) {
  if (timeframe < 60) {
    return { number: number * timeframe, unit: "minute" };
  }
  if (timeframe < 1440) {
    return { number: number * (timeframe / 60), unit: "hour" };
  }
  return { number: number * (timeframe / 1440), unit: "day" };
}

/**
 * Получение максимального таймфрейма из массива
 *
 * @param {Object} timeframes массив таймфреймов в минутах
 */
function getMaxTimeframe(timeframes) {
  return Math.max(...Object.keys(timeframes).map(key => parseInt(key, 10)));
}

/**
 * Получение даты отсчета максимального таймфрейма
 * в зависимости от количества баров
 *
 * @param {Object} timeframes массив таймфреймов в минутах
 * @param {number} maxBars количество баров
 * @returns {Date}
 */
function getMaxTimeframeDateFrom(timeframes, maxBars) {
  const maxTimeframe = getMaxTimeframe(timeframes);
  const { number, unit } = timeframeToTimeUnit(maxBars, maxTimeframe);
  return dayjs
    .utc()
    .add(-number, unit)
    .toISOString();
}

export {
  getCurrentTimeframes,
  createMinutesList,
  createMinutesListWithRange,
  chunkDates,
  handleCandleGaps,
  generateCandleRowKey,
  timeframeToTimeUnit,
  getMaxTimeframe,
  getMaxTimeframeDateFrom
};

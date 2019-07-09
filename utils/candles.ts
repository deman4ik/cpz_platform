import { cpz } from "../types/cpz";
import dayjs from "../lib/dayjs";
import Timeframe from "./timeframe";
import { createDatesList } from "./time";
import { arraysDiff, sortAsc } from "./helpers";

function handleCandleGaps(
  dateFrom: string,
  dateTo: string,
  inputCandles: cpz.ExchangeCandle[]
): cpz.ExchangeCandle[] {
  if (
    !inputCandles ||
    !Array.isArray(inputCandles) ||
    inputCandles.length === 0
  )
    return [];
  let candles = [...inputCandles];
  const { exchange, asset, currency, timeframe } = inputCandles[0];
  const duration = Timeframe.durationTimeframe(dateFrom, dateTo, timeframe);
  const { unit, amountInUnit } = Timeframe.timeframes[timeframe];
  const fullDatesList = [
    ...new Set(createDatesList(dateFrom, dateTo, unit, duration))
  ];
  const loadedDatesList = [...new Set(candles.map(candle => candle.time))];
  // Ищем пропуски
  const diffs = arraysDiff(fullDatesList, loadedDatesList).sort(sortAsc);
  // Если есть пропуски
  if (diffs.length > 0) {
    // Для каждой пропущенный свечи
    diffs.forEach(diffTime => {
      // Время предыдущей свечи
      const previousTime = dayjs
        .utc(diffTime)
        .add(-amountInUnit, unit)
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
          exchange, // код биржи
          asset, // базовая валюта
          currency, // котировка валюты
          timeframe, // таймфрейм в минутах
          time: diffTime, // время в милисекундах
          timestamp: dayjs.utc(diffTime).toISOString(), // время в ISO UTC
          open: previousCandle.close, // цена открытия = цене закрытия предыдущей
          high: previousCandle.close, // максимальная цена = цене закрытия предыдущей
          low: previousCandle.close, // минимальная цена = цене закрытия предыдущей
          close: previousCandle.close, // цена закрытия = цене закрытия предыдущей
          volume: 0, // нулевой объем
          type: cpz.CandleType.previous // тип - предыдущая
        };

        candles.push(gappedCandle);
        candles = candles.sort((a, b) => sortAsc(a.time, b.time));
      }
    });
  }
  candles = candles.filter(
    c =>
      c.time >= dayjs.utc(dateFrom).valueOf() &&
      c.time < dayjs.utc(dateTo).valueOf()
  );
  return [...new Set(candles)];
}

function batchCandles(
  dateFrom: string,
  dateTo: string,
  timeframe: cpz.ValidTimeframe,
  inputCandles: cpz.ExchangeCandle[]
): cpz.ExchangeCandle[] {
  let timeframeCandles: cpz.ExchangeCandle[] = [];
  if (
    !inputCandles ||
    !Array.isArray(inputCandles) ||
    inputCandles.length === 0
  )
    return [];
  let candles = [...inputCandles];
  const { exchange, asset, currency } = inputCandles[0];
  const duration = Timeframe.durationTimeframe(dateFrom, dateTo, timeframe);
  const { unit, amountInUnit } = Timeframe.timeframes[timeframe];
  const fullDatesList = [
    ...new Set(createDatesList(dateFrom, dateTo, unit, duration + 1)) // добавляем еще одну свечу чтобы сформировать прошедший таймфрейм
  ];
  fullDatesList.forEach(time => {
    const date = dayjs.utc(time);
    // Пропускаем самую первую свечу
    if (dayjs.utc(dateFrom).valueOf() === date.valueOf()) return;
    const vallid = Timeframe.isValidTimeframeByDate(time, timeframe);
    if (vallid) {
      const timeFrom = date.add(-amountInUnit, unit).valueOf();
      const timeTo = date.valueOf();
      const currentCandles = candles
        .filter(candle => candle.time >= timeFrom && candle.time < timeTo)
        .sort((a, b) => sortAsc(a.time, b.time));
      if (currentCandles.length > 0) {
        const volume = +currentCandles
          .map(t => t.volume)
          .reduce((a, b) => a + b, 0);
        timeframeCandles.push({
          exchange,
          asset,
          currency,
          timeframe,
          time: timeFrom, // время в милисекундах
          timestamp: dayjs.utc(timeFrom).toISOString(), // время в ISO UTC
          open: +candles[0].open, // цена открытия - цена открытия первой свечи
          high: Math.max(...currentCandles.map(t => +t.high)), // максимальная цена
          low: Math.min(...currentCandles.map(t => +t.low)), // минимальная цена
          close: +currentCandles[currentCandles.length - 1].close, // цена закрытия - цена закрытия последней свечи
          volume, // объем - сумма объема всех свечей
          type: volume === 0 ? cpz.CandleType.previous : cpz.CandleType.created
        });
      }
    }
  });
  if (timeframeCandles.length > 0)
    timeframeCandles.sort((a, b) => sortAsc(a.time, b.time));

  return [...new Set(timeframeCandles)];
}

function getCurrentCandleParams(
  exchangeTimeframes: cpz.ExchangeTimeframes,
  timeframe: cpz.ValidTimeframe
) {
  const timeframeStr = Timeframe.toString(timeframe);

  const candleTime = Timeframe.getCurrentSince(1, timeframe);
  const params = {
    timeframe,
    timeframeStr,
    dateFrom: candleTime,
    time: candleTime,
    limit: 1,
    batch: false
  };
  const exchangeHasTimeframe = Timeframe.inList(
    exchangeTimeframes,
    timeframeStr
  );

  if (!exchangeHasTimeframe) {
    const { lower, amountInUnit } = Timeframe.get(timeframe);
    params.timeframe = lower;
    params.timeframeStr = Timeframe.toString(lower);
    params.dateFrom = Timeframe.getCurrentSince(amountInUnit, lower);
    params.limit = amountInUnit;
    params.batch = true;
  }

  return params;
}

function getCandlesParams(
  exchangeTimeframes: cpz.ExchangeTimeframes,
  timeframe: cpz.ValidTimeframe,
  dateFrom: string,
  limit: number
) {
  let currentTimeframe = Timeframe.get(timeframe);
  const exchangeHasTimeframe = Timeframe.inList(
    exchangeTimeframes,
    Timeframe.toString(timeframe)
  );
  if (!exchangeHasTimeframe) {
    currentTimeframe = Timeframe.get(currentTimeframe.lower);
  }

  const { amount, unit } = Timeframe.timeframeAmountToTimeUnit(
    limit,
    currentTimeframe.value
  );

  return {
    timeframe: currentTimeframe.value,
    timeframeStr: currentTimeframe.str,
    dateFrom: dayjs
      .utc(dateFrom)
      .add(-3 * currentTimeframe.amountInUnit, unit)
      .valueOf(),
    dateTo: dayjs
      .utc(dateFrom)
      .add(amount, unit)
      .valueOf(),
    unit,
    limit: limit + 3,
    batch: !exchangeHasTimeframe
  };
}

export {
  handleCandleGaps,
  batchCandles,
  getCurrentCandleParams,
  getCandlesParams
};

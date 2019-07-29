import { cpz } from "../types/cpz";
import dayjs from "../lib/dayjs";
import Timeframe from "./timeframe";
import { createDatesList, createDatesListWithRange } from "./time";
import { arraysDiff, sortAsc, uniqueElementsBy } from "./helpers";

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
  const fullDatesList = createDatesList(dateFrom, dateTo, unit, 1, duration);

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
  candles = uniqueElementsBy(candles, (a, b) => a.time === b.time).filter(
    c =>
      c.time >= dayjs.utc(dateFrom).valueOf() &&
      c.time < dayjs.utc(dateTo).valueOf()
  );
  return candles;
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
  const fullDatesList = createDatesList(
    dateFrom,
    dateTo,
    unit,
    amountInUnit,
    duration + 1
  );
  // добавляем еще одну свечу чтобы сформировать прошедший таймфрейм

  fullDatesList.forEach(time => {
    const date = dayjs.utc(time);
    // Пропускаем самую первую свечу
    if (dayjs.utc(dateFrom).valueOf() === date.valueOf()) return;

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
  });
  if (timeframeCandles.length > 0)
    timeframeCandles = uniqueElementsBy(
      timeframeCandles,
      (a, b) => a.time === b.time
    ).sort((a, b) => sortAsc(a.time, b.time));

  return timeframeCandles;
}

function createCandlesFromTrades(
  dateFrom: string,
  dateTo: string,
  timeframes: cpz.ValidTimeframe[],
  trades: cpz.ExchangeTrade[]
): cpz.ExchangeCandlesInTimeframes {
  const result: cpz.ExchangeCandlesInTimeframes = {};
  if (trades.length > 0) {
    const { exchange, asset, currency } = trades[0];

    timeframes.forEach(timeframe => {
      result[timeframe] = [];
      const duration = Timeframe.durationTimeframe(dateFrom, dateTo, timeframe);
      if (duration > 0) {
        const { unit, amountInUnit } = Timeframe.get(timeframe);
        const dates = createDatesListWithRange(
          dateFrom,
          dateTo,
          unit,
          amountInUnit,
          duration
        );
        dates.forEach(date => {
          const dateTrades = uniqueElementsBy(
            trades,
            (a, b) => a.time === b.time
          )
            .filter(
              trade =>
                trade.time >= dayjs.utc(date.dateFrom).valueOf() &&
                trade.time <= dayjs.utc(date.dateTo).valueOf()
            )
            .sort((a, b) => sortAsc(a.time, b.time));

          if (dateTrades && dateTrades.length > 0) {
            const volume = +dateTrades
              .map(t => t.amount)
              .reduce((a, b) => a + b, 0);
            result[timeframe].push({
              exchange,
              asset,
              currency,
              timeframe: timeframe,
              time: +date.dateFrom, // время в милисекундах
              timestamp: dayjs.utc(date.dateFrom).toISOString(), // время в ISO UTC
              open: +dateTrades[0].price, // цена открытия - цена первого тика
              high: +Math.max(...dateTrades.map(t => +t.price)), // максимальная цена тиков
              low: +Math.min(...dateTrades.map(t => +t.price)), // минимальная цена тиков
              close: +dateTrades[dateTrades.length - 1].price, // цена закрытия - цена последнего тика
              volume, // объем - сумма объема всех тиков
              type:
                volume === 0 ? cpz.CandleType.previous : cpz.CandleType.created // признак - свеча сформирована
            });
          }
        });
        result[timeframe] = uniqueElementsBy(
          result[timeframe],
          (a, b) => a.time === b.time
        )
          .filter(
            candle =>
              candle.time >= dayjs.utc(dateFrom).valueOf() &&
              candle.time <= dayjs.utc(dateTo).valueOf()
          )
          .sort((a, b) => sortAsc(a.time, b.time));
      }
    });
  }
  return result;
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

function loadLimit(exchange: cpz.ExchangeName) {
  switch (exchange) {
    case cpz.Exchange.bitfinex:
      return 950;
    case cpz.Exchange.kraken:
      return 450;
    default:
      return 250;
  }
}

export {
  handleCandleGaps,
  batchCandles,
  createCandlesFromTrades,
  getCurrentCandleParams,
  getCandlesParams,
  loadLimit
};

import { cpz } from "../types/cpz";
import dayjs from "../lib/dayjs";
import Timeframe from "./timeframe";
import { createDatesList, createDatesListWithRange } from "./time";
import { arraysDiff, sortAsc, uniqueElementsBy } from "./helpers";

async function handleCandleGaps(
  dateFrom: string,
  dateTo: string,
  inputCandles: cpz.ExchangeCandle[]
): Promise<cpz.ExchangeCandle[]> {
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

  const loadedDatesList = candles.map(candle => candle.time);
  // Ищем пропуски
  const diffs = arraysDiff(fullDatesList, loadedDatesList).sort(sortAsc);
  // Если есть пропуски
  if (diffs.length > 0) {
    // Для каждой пропущенный свечи
    diffs.forEach(async diffTime => {
      // Время предыдущей свечи
      const previousTime = dayjs
        .utc(diffTime)
        .add(-amountInUnit, unit)
        .valueOf();
      // Предыдущая свеча
      const previousCandle = candles.find(
        candle => candle.time === previousTime
      );
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
  return candles;
}

async function batchCandles(
  dateFrom: string,
  dateTo: string,
  timeframe: cpz.ValidTimeframe,
  inputCandles: cpz.ExchangeCandle[]
): Promise<cpz.ExchangeCandle[]> {
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

  fullDatesList.forEach(async time => {
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
    timeframeCandles = timeframeCandles.sort((a, b) => sortAsc(a.time, b.time));

  return timeframeCandles;
}

async function createCandlesFromTrades(
  dateFrom: string,
  dateTo: string,
  timeframes: cpz.ValidTimeframe[],
  trades: cpz.ExchangeTrade[]
): Promise<cpz.ExchangeCandlesInTimeframes> {
  try {
    const result: cpz.ExchangeCandlesInTimeframes = {};
    if (trades.length > 0) {
      const { exchange, asset, currency } = trades[0];

      await Promise.all(
        timeframes.map(async timeframe => {
          result[timeframe] = [];
          let currentTrades = [...trades];
          const duration = Timeframe.durationTimeframe(
            dateFrom,
            dateTo,
            timeframe
          );
          if (duration > 0) {
            const { unit, amountInUnit } = Timeframe.get(timeframe);
            const dates = createDatesListWithRange(
              dateFrom,
              dateTo,
              unit,
              amountInUnit,
              duration
            );

            await Promise.all(
              dates.map(async date => {
                const dateTrades = currentTrades.filter(
                  trade =>
                    trade.time >= date.dateFrom && trade.time <= date.dateTo
                );

                if (dateTrades && dateTrades.length > 0) {
                  currentTrades = currentTrades.slice(dateTrades.length);
                  const volume = +dateTrades
                    .map(t => t.amount)
                    .reduce((a, b) => a + b, 0);
                  const prices = dateTrades.map(t => +t.price);
                  result[timeframe].push({
                    exchange,
                    asset,
                    currency,
                    timeframe: timeframe,
                    time: +date.dateFrom, // время в милисекундах
                    timestamp: dayjs.utc(date.dateFrom).toISOString(), // время в ISO UTC
                    open: +dateTrades[0].price, // цена открытия - цена первого тика
                    high: +Math.max(...prices), // максимальная цена тиков
                    low: +Math.min(...prices), // минимальная цена тиков
                    close: +dateTrades[dateTrades.length - 1].price, // цена закрытия - цена последнего тика
                    volume, // объем - сумма объема всех тиков
                    type:
                      volume === 0
                        ? cpz.CandleType.previous
                        : cpz.CandleType.created // признак - свеча сформирована
                  });
                }
              })
            );
            result[timeframe] = result[timeframe].sort((a, b) =>
              sortAsc(a.time, b.time)
            );
          }
        })
      );
    }
    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
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

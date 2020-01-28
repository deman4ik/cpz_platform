import {
  uniqueElementsBy,
  createCandlesFromTrades,
  handleCandleGaps,
  sortAsc
} from "../utils";
import { cpz } from "../@types";
import dayjs from "../lib/dayjs";
import { expose } from "threads/worker";

function uniqueCandles(
  arr: cpz.Candle[],
  dateStart: string,
  dateStop: string
): cpz.Candle[] {
  return uniqueElementsBy(arr, (a, b) => a.time === b.time)
    .filter(
      candle =>
        candle.time >= dayjs.utc(dateStart).valueOf() &&
        candle.time <= dayjs.utc(dateStop).valueOf()
    )
    .sort((a, b) => sortAsc(a.time, b.time));
}

function uniqueTrades(
  trades: cpz.ExchangeTrade[],
  dateFrom: string,
  dateTo: string
): cpz.ExchangeTrade[] {
  return uniqueElementsBy(
    trades,
    (a, b) =>
      a.time === b.time &&
      a.price === b.price &&
      a.amount === b.amount &&
      a.side === b.side
  )
    .filter(
      trade =>
        trade.time >= dayjs.utc(dateFrom).valueOf() &&
        trade.time <= dayjs.utc(dateTo).valueOf()
    )
    .sort((a, b) => sortAsc(a.time, b.time));
}

const importerUtils = {
  uniqueCandles,
  uniqueTrades,
  createCandlesFromTrades,
  handleCandleGaps
};

export type ImporterUtils = typeof importerUtils;

expose(importerUtils);

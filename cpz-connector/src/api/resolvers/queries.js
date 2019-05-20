import getBalance from "./balance";
import { checkOrder } from "./orders";
import {
  loadCurrentCandle,
  loadLastMinuteCandle,
  loadMinuteCandles
} from "./candles";
import getMarket from "./market";
import loadTrades from "./trades";
import getTimeframes from "./timeframes";

const queries = {
  order: checkOrder,
  balance: getBalance,
  market: getMarket,
  timeframes: getTimeframes,
  currentCandle: loadCurrentCandle,
  lastMinuteCandle: loadLastMinuteCandle,
  minuteCandles: loadMinuteCandles,
  trades: loadTrades
};

export default queries;

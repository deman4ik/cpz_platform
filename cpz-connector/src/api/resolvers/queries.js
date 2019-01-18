import { getBalance } from "./balance";
import { checkOrder } from "./orders";
import { loadLastMinuteCandle, loadMinuteCandles } from "./candles";
import { getMarket } from "./market";
import { loadTrades } from "./trades";

const queries = {
  order: checkOrder,
  balance: getBalance,
  market: getMarket,
  lastMinuteCandle: loadLastMinuteCandle,
  minuteCandles: loadMinuteCandles,
  trades: loadTrades
};

export default queries;

import { getBalance } from "./balance";
import { checkOrder } from "./order";
import { loadLastMinuteCandle, loadMinuteCandles } from "./candle";

const queries = {
  order: checkOrder,
  balance: getBalance,
  lastMinuteCandle: loadLastMinuteCandle,
  minuteCandles: loadMinuteCandles
};

export default queries;

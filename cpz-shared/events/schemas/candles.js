import { BASE_ERROR } from "./base";
import {
  CANDLES_NEWCANDLE_EVENT,
  CANDLES_HANDLED_EVENT
} from "../types/candles";
import { ADVISER_SERVICE } from "../../config/services";
import { VALID_TIMEFRAMES } from "../../config/state/timeframes";

const CANDLES_NEWCANDLE_EVENT_SCHEMA = {
  [CANDLES_NEWCANDLE_EVENT]: {
    id: { description: "Uniq Candle Id.", type: "string", empty: false },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "enum",
      values: VALID_TIMEFRAMES
    },
    time: { description: "Candle time in seconds.", type: "number" },
    timestamp: {
      description: "Candle timestamp in UTC.",
      type: "datetime"
    },
    open: { description: "Candle Open Price.", type: "number" },
    high: { description: "Candle Highest Price.", type: "number" },
    low: { description: "Trade Lowest Price.", type: "number" },
    close: { description: "Candle Close Price.", type: "number" },
    volume: { description: "Candle Volume.", type: "number" }
  }
};
const CANDLES_HANDLED_EVENT_SCHEMA = {
  [CANDLES_HANDLED_EVENT]: {
    id: { description: "Uniq Candle Id.", type: "string", empty: false },
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    serviceName: {
      description: "Sevice name handeling event",
      type: "string",
      values: [ADVISER_SERVICE]
    },
    success: { description: "Success Sign.", type: "boolean" },
    error: BASE_ERROR
  }
};

export { CANDLES_NEWCANDLE_EVENT_SCHEMA, CANDLES_HANDLED_EVENT_SCHEMA };

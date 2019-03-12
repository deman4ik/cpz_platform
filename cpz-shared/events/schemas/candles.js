import { BASE_ERROR } from "./base";
import {
  CANDLES_NEWCANDLE_EVENT,
  CANDLES_HANDLED_EVENT
} from "../types/candles";

const CANDLES_EVENTS = {
  [CANDLES_NEWCANDLE_EVENT]: {
    id: { description: "Uniq Candle Id.", type: "string", empty: false },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "int"
    },
    time: { description: "Candle time in seconds.", type: "number" },
    timestamp: {
      description: "Candle timestamp in UTC.",
      type: "datetime"
    },
    open: { description: "Candle Open Price.", type: "number" },
    close: { description: "Candle Close Price.", type: "number" },
    high: { description: "Candle Highest Price.", type: "number" },
    low: { description: "Trade Lowest Price.", type: "number" },
    volume: { description: "Candle Volume.", type: "number" }
  },
  [CANDLES_HANDLED_EVENT]: {
    id: { description: "Uniq Candle Id.", type: "string", empty: false },
    service: {
      description: "Sevice name handeling event",
      type: "string",
      values: ["adviser", "trader"]
    },
    success: {
      description: "Success execution list",
      type: "array",
      items: "string",
      optional: true
    },
    error: {
      description: "Error execution list",
      type: "array",
      items: {
        type: "object",
        props: {
          taskId: { type: "string", empty: false },
          error: BASE_ERROR
        }
      },
      optional: true
    },
    successPending: {
      description: "Success queued list",
      type: "array",
      items: "string",
      optional: true
    },
    errorPending: {
      description: "Error queued list",
      type: "array",
      items: {
        type: "object",
        props: {
          taskId: { type: "string", empty: false },
          error: BASE_ERROR
        }
      },
      optional: true
    }
  }
};

export default CANDLES_EVENTS;

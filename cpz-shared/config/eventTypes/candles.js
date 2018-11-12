import { BASE_ERROR } from "./events";

const CANDLES_NEWCANDLE_EVENT = {
  eventType: "CPZ.Candles.NewCandle",

  dataSchema: {
    id: { description: "Uniq Candle Id.", type: "string", empty: false },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
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
  }
};
const CANDLES_HANDLED_EVENT = {
  eventType: "CPZ.Candles.Handled",

  dataSchema: {
    id: { description: "Uniq Candle Id.", type: "string", empty: false },
    service: {
      description: "Sevice name handeling event",
      type: "string",
      values: ["adviser", "trader"]
    },
    success: {
      description: "Success execution list",
      type: "array",
      items: "string"
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
      }
    }
  },
  successPending: {
    description: "Success queued list",
    type: "array",
    items: "string"
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
    }
  }
};

export { CANDLES_HANDLED_EVENT, CANDLES_NEWCANDLE_EVENT };

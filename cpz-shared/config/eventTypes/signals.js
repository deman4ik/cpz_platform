import { BASE_ERROR } from "./events";

const SIGNALS_NEWSIGNAL_EVENT = {
  eventType: "CPZ.Signals.NewSignal",

  dataSchema: {
    signalId: { description: "Uniq Candle Id.", type: "string", empty: false },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    robotId: {
      description: "Robot uniq Id.",
      type: "string",
      empty: false
    },
    adviserId: {
      description: "Adviser task Id.",
      type: "string",
      empty: false
    },
    alertTime: {
      description: "Signal time in seconds.",
      type: "number"
    },
    timestamp: {
      description: "Signal timestamp in UTC.",
      type: "datetime",
      optinal: true // TODO: remove after altering adviser
    },
    action: {
      description: "Signal type.",
      type: "string",
      values: ["long", "closeLong", "short", "closeShort"]
    },
    qty: {
      description: "Volume.",
      type: "number",
      optional: true
    },
    orderType: {
      description: "Order type.",
      type: "string",
      values: ["stop", "limit", "market"],
      optional: true
    },
    price: {
      description: "Price in quote currency.",
      type: "number"
    },
    priceSource: {
      description: "Candle field.",
      type: "string",
      values: ["open", "close", "high", "low", "stop"]
    },
    positionId: {
      description: "Uniq position Id",
      type: "number"
    },
    candle: {
      description: "Signal from Candle.",
      type: "object",
      props: {
        time: { description: "Candle time in seconds.", type: "number" },
        open: { description: "Candle Open Price.", type: "number" },
        close: { description: "Candle Close Price.", type: "number" },
        high: { description: "Candle Highest Price.", type: "number" },
        low: { description: "Trade Lowest Price.", type: "number" },
        volume: { description: "Candle Volume.", type: "number" }
      },
      optional: true
    },
    settings: {
      description: "Trader parameters.",
      type: "object",
      props: {
        slippageStep: {
          description: "Price Slippage Step.",
          type: "number"
        },
        deviation: {
          description: "Price deviation",
          type: "number"
        }
      },
      optional: true
    }
  }
};
const SIGNALS_HANDLED_EVENT = {
  eventType: "CPZ.Signals.Handled",

  dataSchema: {
    signalId: { description: "Uniq Signal Id.", type: "string", empty: false },
    service: {
      description: "Sevice name handeling event",
      type: "string",
      values: ["trader"]
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

export { SIGNALS_HANDLED_EVENT, SIGNALS_NEWSIGNAL_EVENT };

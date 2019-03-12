import { BASE_ERROR } from "./base";
import { TRADER_SETTINGS } from "./settings";
import {
  SIGNALS_NEWSIGNAL_EVENT,
  SIGNALS_HANDLED_EVENT
} from "../types/signals";

const SIGNALS_EVENTS = {
  [SIGNALS_NEWSIGNAL_EVENT]: {
    signalId: { description: "Uniq Candle Id.", type: "string", empty: false },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "int"
    },
    adviserId: {
      description: "Adviser task Id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id.",
      type: "int",
      empty: false
    },
    timestamp: {
      description: "Signal timestamp in UTC.",
      type: "datetime"
    },
    action: {
      description: "Signal type.",
      type: "string",
      values: ["long", "closeLong", "short", "closeShort"]
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
      values: ["open", "close", "high", "low", "stop"],
      optional: true
    },
    candleId: {
      description: "Candle uniq Id.",
      type: "string",
      optional: true
    },
    candleTimestamp: {
      description: "Candle timestamp.",
      type: "string",
      optional: true
    },
    positionId: {
      description: "Uniq position Id",
      type: "string"
    },
    settings: {
      description: "Trader parameters.",
      type: "object",
      props: {
        slippageStep: TRADER_SETTINGS.slippageStep,
        deviation: TRADER_SETTINGS.deviation,
        volume: TRADER_SETTINGS.volume,
        positionCode: {
          description: "Position code.",
          type: "string",
          optional: true,
          empty: false
        }
      },
      optional: true
    }
  },
  [SIGNALS_HANDLED_EVENT]: {
    signalId: { description: "Uniq Signal Id.", type: "string", empty: false },
    service: {
      description: "Sevice name handeling event",
      type: "string",
      values: ["trader"]
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

export default SIGNALS_EVENTS;

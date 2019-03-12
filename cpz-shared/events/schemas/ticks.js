import { BASE_ERROR } from "./base";
import { TICKS_NEWTICK_EVENT, TICKS_HANDLED_EVENT } from "../types/ticks";

const TICKS_EVENTS = {
  [TICKS_NEWTICK_EVENT]: {
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    direction: {
      description: "Price direction.",
      type: "string",
      values: ["up", "down", "unchanged"]
    },
    price: { description: "Trade Price.", type: "number" },
    timestamp: {
      description: "Trade timestamp in UTC.",
      type: "datetime"
    },
    volume: { description: "Trade Volume.", type: "number" },
    tradeId: {
      description: "Trade ID.",
      type: "string",
      empty: false
    }
  },
  [TICKS_HANDLED_EVENT]: {
    tradeId: { description: "Uniq Trade Id.", type: "string", empty: false },
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
    }
  }
};
export default TICKS_EVENTS;

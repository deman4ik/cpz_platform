import { BASE_ERROR } from "./base";
import { TICKS_NEWTICK_EVENT, TICKS_HANDLED_EVENT } from "../types/ticks";

const TICKS_NEWTICK_EVENT_SCHEMA = {
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
  }
};

export { TICKS_NEWTICK_EVENT_SCHEMA };

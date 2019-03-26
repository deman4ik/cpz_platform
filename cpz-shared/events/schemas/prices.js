import { BASE_ERROR } from "./base";
import { PRICES_HANDLED_EVENT } from "../types/prices";

const PRICES_HANDLED_EVENT_SCHEMA = {
  [PRICES_HANDLED_EVENT]: {
    traderId: { description: "Trader Task ID.", type: "string", empty: false },
    candleId: {
      description: "Candle ID.",
      type: "string",
      empty: false,
      optional: true
    },
    tickId: {
      description: "Tick ID.",
      type: "string",
      empty: false,
      optional: true
    },
    timestamp: {
      description: "Price timestamp in UTC.",
      type: "datetime"
    },
    price: {
      description: "Price in quote currency.",
      type: "number"
    },
    success: { description: "Success Sign.", type: "boolean" },
    error: BASE_ERROR
  }
};

export { PRICES_HANDLED_EVENT_SCHEMA };

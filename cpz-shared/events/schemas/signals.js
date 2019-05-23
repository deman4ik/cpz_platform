import { BASE_ERROR } from "./base";
import { TRADER_SETTINGS } from "./settings";
import {
  SIGNALS_NEWSIGNAL_EVENT,
  SIGNALS_HANDLED_EVENT
} from "../types/signals";
import {
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_SHORT,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_STOP
} from "../../config/state/types";
import { VALID_TIMEFRAMES } from "../../config/state/timeframes";

const SIGNALS_NEWSIGNAL_EVENT_SCHEMA = {
  [SIGNALS_NEWSIGNAL_EVENT]: {
    signalId: { description: "Uniq Candle Id.", type: "string", empty: false },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "enum",
      values: VALID_TIMEFRAMES
    },
    robotId: {
      description: "Robot uniq Id.",
      type: "number",
      integer: true,
      empty: false
    },
    timestamp: {
      description: "Signal timestamp in UTC.",
      type: "datetime"
    },
    action: {
      description: "Signal type.",
      type: "string",
      values: [
        TRADE_ACTION_LONG,
        TRADE_ACTION_CLOSE_LONG,
        TRADE_ACTION_SHORT,
        TRADE_ACTION_CLOSE_SHORT
      ]
    },
    orderType: {
      description: "Order type.",
      type: "string",
      values: [ORDER_TYPE_STOP, ORDER_TYPE_LIMIT, ORDER_TYPE_MARKET],
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
    position: {
      description: "Position.",
      type: "object",
      props: {
        id: {
          description: "Uniq position Id",
          type: "string"
        },
        prefix: {
          description: "Position prefix",
          type: "string",
          empty: false
        },
        code: {
          description: "Position code.",
          type: "string",
          empty: false
        },
        parentId: {
          description: "Parent position Id",
          type: "string"
        }
      }
    },
    settings: {
      description: "Trader parameters.",
      type: "object",
      props: {
        volume: TRADER_SETTINGS.volume
      },
      optional: true
    }
  }
};
const SIGNALS_HANDLED_EVENT_SCHEMA = {
  [SIGNALS_HANDLED_EVENT]: {
    signalId: { description: "Uniq Signal Id.", type: "string", empty: false },
    traderId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    success: { description: "Success Sign.", type: "boolean" },
    error: BASE_ERROR
  }
};

export { SIGNALS_NEWSIGNAL_EVENT_SCHEMA, SIGNALS_HANDLED_EVENT_SCHEMA };

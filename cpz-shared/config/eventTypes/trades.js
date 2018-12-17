import { TRADER_SETTINGS } from "./settings";
import {
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_STOP,
  ORDER_DIRECTION_BUY,
  ORDER_DIRECTION_SELL,
  ORDER_POS_DIR_ENTRY,
  ORDER_POS_DIR_EXIT,
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_SHORT
} from "../state/types";

import {
  POS_STATUS_NONE,
  POS_STATUS_OPENED,
  POS_STATUS_CLOSED,
  POS_STATUS_CANCELED,
  POS_STATUS_ERROR,
  ORDER_STATUS_NONE,
  ORDER_STATUS_OPENED,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_POSTED,
  ORDER_STATUS_CANCELED,
  ORDER_STATUS_ERROR
} from "../state/status";

const TRADES_ORDER_EVENT = {
  eventType: "CPZ.Trades.Order",

  dataSchema: {
    positionId: {
      description: "Uniq Position Id.",
      type: "string",
      empty: false
    },
    traderId: { description: "Uniq Trader Id.", type: "string", empty: false },
    robotId: {
      description: "Robot uniq Id.",
      type: "number",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "string",
      empty: false
    },
    adviserId: {
      description: "Adviser task Id.",
      type: "string",
      empty: false
    },
    orderId: { description: "Uniq Order Id.", type: "string", empty: false },
    signalId: { description: "Uniq Single Id.", type: "string", empty: false },
    orderType: {
      description: "Order type.",
      type: "string",
      values: [ORDER_TYPE_LIMIT, ORDER_TYPE_MARKET, ORDER_TYPE_STOP],
      optional: true
    },
    price: {
      description: "Price in quote currency.",
      type: "number"
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    createdAt: {
      description: "Order created timestamp in UTC.",
      type: "datetime"
    },
    status: {
      description: "Order status.",
      type: "string",
      values: [
        ORDER_STATUS_NONE,
        ORDER_STATUS_OPENED,
        ORDER_STATUS_CLOSED,
        ORDER_STATUS_POSTED,
        ORDER_STATUS_CANCELED,
        ORDER_STATUS_ERROR
      ]
    },
    direction: {
      description: "Order direction.",
      type: "string",
      values: [ORDER_DIRECTION_BUY, ORDER_DIRECTION_SELL]
    },
    positionDirection: {
      description: "Order position direction.",
      type: "string",
      values: [ORDER_POS_DIR_ENTRY, ORDER_POS_DIR_EXIT]
    },
    action: {
      description: "Signal action.",
      type: "string",
      values: [
        TRADE_ACTION_LONG,
        TRADE_ACTION_CLOSE_LONG,
        TRADE_ACTION_SHORT,
        TRADE_ACTION_CLOSE_SHORT
      ]
    },
    executed: {
      description: "Executed volume.",
      type: "number"
    }
  }
};

const _positionStep = {
  status: {
    description: "Position status.",
    type: "string",
    values: [
      ORDER_STATUS_NONE,
      ORDER_STATUS_OPENED,
      ORDER_STATUS_CLOSED,
      ORDER_STATUS_POSTED,
      ORDER_STATUS_CANCELED,
      ORDER_STATUS_ERROR
    ]
  },
  price: {
    description: "Position price in quote currency.",
    type: "number"
  },
  date: {
    description: "Position timestamp in UTC.",
    type: "datetime"
  },
  executed: {
    description: "Position executed volume.",
    type: "number"
  }
};

const TRADES_POSITION_EVENT = {
  eventType: "CPZ.Trades.Position",

  dataSchema: {
    positionId: {
      description: "Uniq Position Id.",
      type: "string",
      empty: false
    },
    mode: {
      description: "Service run mode.",
      type: "string",
      values: ["backtest", "emulator", "realtime"]
    },
    traderId: { description: "Uniq Trader Id.", type: "string", empty: false },
    robotId: {
      description: "Robot uniq Id.",
      type: "number",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "string",
      empty: false
    },
    adviserId: {
      description: "Adviser task Id.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
    },
    status: {
      description: "Position status.",
      type: "string",
      values: [
        POS_STATUS_NONE,
        POS_STATUS_OPENED,
        POS_STATUS_CLOSED,
        POS_STATUS_CANCELED,
        POS_STATUS_ERROR
      ]
    },
    direction: {
      description: "Position direction.",
      type: "string",
      values: [ORDER_DIRECTION_BUY, ORDER_DIRECTION_SELL]
    },
    options: {
      description: "Position options.",
      type: "object",
      optional: true
    },
    settings: {
      description: "Position settings.",
      type: "object",
      props: TRADER_SETTINGS
    },
    entry: {
      description: "Position entry.",
      type: "object",
      props: _positionStep
    },
    exit: {
      description: "Position exit.",
      type: "object",
      props: _positionStep
    }
  }
};

export { TRADES_ORDER_EVENT, TRADES_POSITION_EVENT };

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
} from "../../config/state/types";
import {
  POS_STATUS_NEW,
  POS_STATUS_OPEN,
  POS_STATUS_CLOSED,
  POS_STATUS_CANCELED,
  POS_STATUS_ERROR,
  ORDER_STATUS_NEW,
  ORDER_STATUS_OPEN,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_CANCELED,
  ORDER_STATUS_ERROR
} from "../../config/state/status";
import { TRADES_ORDER_EVENT, TRADES_POSITION_EVENT } from "../types/trades";

const _positionStep = {
  status: {
    description: "Position status.",
    type: "string",
    values: [
      ORDER_STATUS_NEW,
      ORDER_STATUS_OPEN,
      ORDER_STATUS_CLOSED,
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

const TRADES_EVENTS = {
  [TRADES_ORDER_EVENT]: {
    mode: {
      description: "Service run mode.",
      type: "string",
      values: ["backtest", "emulator", "realtime"]
    },
    positionId: {
      description: "Uniq Position Id.",
      type: "string",
      empty: false
    },
    traderId: { description: "Uniq Trader Id.", type: "string", empty: false },
    robotId: {
      description: "Robot uniq Id.",
      type: "int",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "uuid",
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
    volume: {
      description: "Order planned volume.",
      type: "number"
    },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "int"
    },
    createdAt: {
      description: "Order created timestamp in UTC.",
      type: "datetime"
    },
    status: {
      description: "Order status.",
      type: "string",
      values: [
        ORDER_STATUS_NEW,
        ORDER_STATUS_OPEN,
        ORDER_STATUS_CLOSED,
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
    exId: {
      description: "Exchange order id.",
      type: "string"
    },
    exTimestamp: {
      description: "Order created in exchange timestamp UTC.",
      type: "datetime"
    },
    exLastTrade: {
      description: "Order last trade in exchange timestamp UTC.",
      type: "datetime"
    },
    average: {
      description: "Average executed price.",
      type: "number"
    },
    remaining: {
      description: "Temaining amount to fill.",
      type: "number"
    },
    executed: {
      description: "Executed volume.",
      type: "number"
    }
  },
  [TRADES_POSITION_EVENT]: {
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
      type: "int",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "uuid",
      empty: false
    },
    adviserId: {
      description: "Adviser task Id.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "int"
    },
    status: {
      description: "Position status.",
      type: "string",
      values: [
        POS_STATUS_NEW,
        POS_STATUS_OPEN,
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

export default TRADES_EVENTS;
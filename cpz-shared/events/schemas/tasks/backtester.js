import { BASE_ERROR } from "../base";
import {
  ADVISER_SETTINGS,
  TRADER_SETTINGS,
  BACKTESTER_SETTINGS
} from "../settings";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT,
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_STOPPED_EVENT,
  TASKS_BACKTESTER_FINISHED_EVENT
} from "../../types/tasks/backtester";
import { VALID_TIMEFRAMES } from "../../../config/state/timeframes";

const TASKS_BACKTESTER_START_EVENT_SCHEMA = {
  [TASKS_BACKTESTER_START_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id.",
      type: "number",
      integer: true
    },
    userId: {
      description: "User uniq Id.",
      type: "uuid"
    },
    strategyName: {
      description: "Strategy file name.",
      type: "string",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "enum",
      values: VALID_TIMEFRAMES
    },
    dateFrom: {
      description: "Backtest start date.",
      type: "datefrom"
    },
    dateTo: {
      description: "Backtest end date.",
      type: "dateto"
    },
    settings: {
      description: "Backtester settings.",
      type: "object",
      props: BACKTESTER_SETTINGS
    },
    adviserSettings: {
      description: "Adviser settings.",
      type: "object",
      props: ADVISER_SETTINGS
    },
    traderSettings: {
      description: "Trader settings.",
      type: "object",
      props: TRADER_SETTINGS
    }
  }
};
const TASKS_BACKTESTER_STOP_EVENT_SCHEMA = {
  [TASKS_BACKTESTER_STOP_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};
const TASKS_BACKTESTER_STARTED_EVENT_SCHEMA = {
  [TASKS_BACKTESTER_STARTED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_BACKTESTER_STOPPED_EVENT_SCHEMA = {
  [TASKS_BACKTESTER_STOPPED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_BACKTESTER_FINISHED_EVENT_SCHEMA = {
  [TASKS_BACKTESTER_FINISHED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

export {
  TASKS_BACKTESTER_START_EVENT_SCHEMA,
  TASKS_BACKTESTER_STOP_EVENT_SCHEMA,
  TASKS_BACKTESTER_STARTED_EVENT_SCHEMA,
  TASKS_BACKTESTER_STOPPED_EVENT_SCHEMA,
  TASKS_BACKTESTER_FINISHED_EVENT_SCHEMA
};

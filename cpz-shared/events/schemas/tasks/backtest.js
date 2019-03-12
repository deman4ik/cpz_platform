import { BASE_ERROR } from "../base";
import {
  BACKTESTER_SETTINGS,
  ADVISER_SETTINGS,
  TRADER_SETTINGS
} from "../settings";
import {
  BACKTEST_START,
  BACKTEST_STOP,
  TASKS_BACKTEST_STARTED_EVENT,
  TASKS_BACKTEST_STOPPED_EVENT,
  TASKS_BACKTEST_FINISHED_EVENT
} from "../../types/tasks/backtest";

const TASKS_BACKTEST_EVENTS = {
  [BACKTEST_START]: {
    robotId: {
      description: "Robot uniq Id.",
      type: "number",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "uuid",
      empty: false
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
      props: BACKTESTER_SETTINGS,
      optional: true
    },
    adviserSettings: {
      description: "Adviser settings.",
      type: "object",
      props: ADVISER_SETTINGS,
      optional: true
    },
    traderSettings: {
      description: "Trader settings.",
      type: "object",
      props: TRADER_SETTINGS,
      optional: true
    }
  },
  [BACKTEST_STOP]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  },
  [TASKS_BACKTEST_STARTED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  },
  [TASKS_BACKTEST_STOPPED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  },
  [TASKS_BACKTEST_FINISHED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

export default TASKS_BACKTEST_EVENTS;

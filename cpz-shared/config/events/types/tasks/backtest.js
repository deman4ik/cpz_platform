import { BASE_ERROR } from "../base";
import {
  BACKTESTER_SETTINGS,
  ADVISER_SETTINGS,
  TRADER_SETTINGS
} from "../settings";

const BACKTEST_START_PARAMS = {
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
};

const BACKTEST_STOP_PARAMS = {
  taskId: {
    description: "Uniq task id.",
    type: "string",
    empty: false
  }
};

const TASKS_BACKTEST_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Backtest.Started",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

const TASKS_BACKTEST_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Backtest.Stopped",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

const TASKS_BACKTEST_FINISHED_EVENT = {
  eventType: "CPZ.Tasks.Backtest.Finished",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

export {
  BACKTEST_START_PARAMS,
  BACKTEST_STOP_PARAMS,
  TASKS_BACKTEST_STARTED_EVENT,
  TASKS_BACKTEST_STOPPED_EVENT,
  TASKS_BACKTEST_FINISHED_EVENT
};

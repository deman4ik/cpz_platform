import { BASE_ERROR } from "../base";
import {
  ADVISER_SETTINGS,
  TRADER_SETTINGS,
  BACKTESTER_SETTINGS
} from "../settings";

const TASKS_BACKTESTER_START_EVENT = {
  eventType: "CPZ.Tasks.Backtester.Start",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
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
    strategyName: {
      description: "Strategy file name.",
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
    // TODO: datefrom/dateto custom validation
    dateFrom: {
      description: "Backtest start date.",
      type: "datetime"
    },
    dateTo: {
      description: "Backtest end date.",
      type: "datetime"
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

const TASKS_BACKTESTER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Backtester.Stop",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

const TASKS_BACKTESTER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Backtester.Started",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

const TASKS_BACKTESTER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Backtester.Stopped",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

const TASKS_BACKTESTER_FINISHED_EVENT = {
  eventType: "CPZ.Tasks.Backtester.Finished",
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
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT,
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_STOPPED_EVENT,
  TASKS_BACKTESTER_FINISHED_EVENT
};

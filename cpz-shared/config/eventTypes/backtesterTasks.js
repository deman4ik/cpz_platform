import { BASE_ERROR } from "./events";

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
      type: "string",
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
    debug: {
      description: "Debug mode.",
      type: "boolean",
      empty: false,
      optional: true
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
      type: "number",
      empty: false
    },
    settings: {
      description: "Adviser parameters.",
      type: "object",
      optional: true
    },
    slippageStep: {
      description: "Price Slippage Step.",
      type: "number",
      empty: false,
      optional: true
    },
    deviation: {
      description: "Price deviation",
      type: "number"
    },
    volume: {
      description: "User trade volume",
      type: "number",
      empty: false,
      optional: true
    },
    requiredHistoryCache: {
      description: "Load history data from cache.",
      type: "boolean",
      optional: true,
      default: true
    },
    requiredHistoryMaxBars: {
      description: "Load history data from cache.",
      type: "number",
      integer: true,
      optional: true
    },
    // TODO: datefrom/dateto custom validation
    dateFrom: {
      description: "Backtest start date.",
      type: "datetime"
    },
    dateTo: {
      description: "Backtest end date.",
      type: "datetime"
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
    rowKey: {
      description: "Table storage uniq row key.",
      type: "string",
      empty: false
    },
    partitionKey: {
      description: "Table storage partition key.",
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
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_FINISHED_EVENT
};

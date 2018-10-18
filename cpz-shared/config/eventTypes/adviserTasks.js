import { BASE_ERROR } from "./events";

/**
 * Событие - Запуск нового советника
 */
const TASKS_ADVISER_START_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Start",

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
    mode: {
      description: "Service run mode.",
      type: "string",
      values: ["backtest", "emulator", "realtime"]
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
      type: "number"
    },
    settings: {
      description: "Adviser parameters.",
      type: "object",
      optional: true
    },
    // TODO: datefrom/dateto custom validation
    dateFrom: {
      description: "Backtest start date.",
      type: "datetime"
    },
    dateTo: {
      description: "Backtest start date.",
      type: "datetime"
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
    }
  }
};

const TASKS_ADVISER_STARTBACKTEST_EVENT = {
  eventType: "CPZ.Tasks.Adviser.StartBacktest",

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
      type: "number"
    },
    settings: {
      description: "Adviser parameters.",
      type: "object",
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
    }
  }
};

/**
 * Событие - Остановка советника
 */
const TASKS_ADVISER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Stop",

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
    }
  }
};

/**
 * Событие - Обновление параметров советника
 */
const TASKS_ADVISER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Update",

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
    eventSubject: {
      description: "Event subject.",
      type: "string",
      optional: true
    },
    debug: {
      description: "Debug mode.",
      type: "boolean",
      optional: true
    },
    settings: {
      description: "Adviser parameters.",
      type: "object",
      optional: true
    },
    requiredHistoryCache: {
      description: "Load history data from cache.",
      type: "boolean",
      optional: true
    },
    requiredHistoryMaxBars: {
      description: "Load history data from cache.",
      type: "number",
      integer: true,
      optional: true
    }
  }
};

/**
 *  Событие - Советник запущен
 */
const TASKS_ADVISER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Started",

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

const TASKS_ADVISER_BACKTESTSTARTED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.BacktestStarted",
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

const TASKS_ADVISER_BACKTESTFINISHED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.BacktestFinished",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

/**
 * Событие - Советник остановлен
 */
const TASKS_ADVISER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Stopped",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

/**
 * Событие - Параметры советника обновлены
 */
const TASKS_ADVISER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Adviser.Updated",

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
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  TASKS_ADVISER_UPDATED_EVENT,
  TASKS_ADVISER_STARTBACKTEST_EVENT,
  TASKS_ADVISER_BACKTESTSTARTED_EVENT,
  TASKS_ADVISER_BACKTESTFINISHED_EVENT
};

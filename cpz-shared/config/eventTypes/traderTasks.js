import { BASE_ERROR } from "./events";

/**
 * Событие - запуск нового проторговщика
 */
const TASKS_TRADER_START_EVENT = {
  eventType: "CPZ.Tasks.Trader.Start",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id. - 'AdvisorName'",
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
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "number"
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
    }
  }
};

/**
 * Событие - Остановка проторговщика
 */
const TASKS_TRADER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Trader.Stop",

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
 * Событие - Обновление параметров проторговщика
 */
const TASKS_TRADER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Trader.Update",

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
      type: "boolean"
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
    }
  }
};

/**
 * Событие - Проторговщик запущен
 */
const TASKS_TRADER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Started",

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

/**
 * Событие - Проторговщик остановлен
 */
const TASKS_TRADER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Stopped",

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
 * Событие - параметры проторговщика обновлены
 */
const TASKS_TRADER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Trader.Updated",

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
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TASKS_TRADER_UPDATED_EVENT
};

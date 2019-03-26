import { VALID_TIMEFRAMES } from "../../../config/state/timeframes";
import { BASE_ERROR } from "../base";
import {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STOP_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_STOPPED_EVENT,
  TASKS_IMPORTER_FINISHED_EVENT
} from "../../types/tasks/importer";

const TASKS_IMPORTER_START_EVENT_SCHEMA = {
  [TASKS_IMPORTER_START_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    debug: {
      description: "Debug mode.",
      type: "boolean",
      optional: true
    },
    providerType: {
      description: "Data provider type.",
      type: "string",
      values: ["ccxt"],
      optional: true
    },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframes: {
      description: "Timeframe in minutes.",
      type: "array",
      enum: VALID_TIMEFRAMES,
      optional: true
    },
    requireBatching: {
      description: "Batch loading candles",
      type: "boolean",
      optional: true
    },
    saveToCache: {
      dataSchema: "Save current loaded candles to cache",
      type: "boolean",
      optional: true
    },
    dateFrom: {
      description: "Import start date.",
      type: "datefrom"
    },
    dateTo: {
      description: "Import end date.",
      type: "dateto"
    },
    proxy: {
      description: "Proxy endpoint.",
      type: "string",
      optional: true,
      empty: false
    }
  }
};
const TASKS_IMPORTER_STOP_EVENT_SCHEMA = {
  [TASKS_IMPORTER_STOP_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};
const TASKS_IMPORTER_STARTED_EVENT_SCHEMA = {
  [TASKS_IMPORTER_STARTED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_IMPORTER_STOPPED_EVENT_SCHEMA = {
  [TASKS_IMPORTER_STOPPED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_IMPORTER_FINISHED_EVENT_SCHEMA = {
  [TASKS_IMPORTER_FINISHED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

export {
  TASKS_IMPORTER_START_EVENT_SCHEMA,
  TASKS_IMPORTER_STOP_EVENT_SCHEMA,
  TASKS_IMPORTER_STARTED_EVENT_SCHEMA,
  TASKS_IMPORTER_STOPPED_EVENT_SCHEMA,
  TASKS_IMPORTER_FINISHED_EVENT_SCHEMA
};

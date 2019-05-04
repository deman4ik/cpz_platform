import { VALID_TIMEFRAMES } from "../../../config/state/timeframes";
import { BASE_ERROR } from "../base";
import { IMPORTER_SETTINGS } from "../settings";
import {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STOP_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_STOPPED_EVENT,
  TASKS_IMPORTER_FINISHED_EVENT
} from "../../types/tasks/importer";
import {
  IMPORTER_IMPORT_CANDLES_MODE,
  IMPORTER_WARMUP_CACHE_MODE
} from "../../../config/state/types";

const TASKS_IMPORTER_START_EVENT_SCHEMA = {
  [TASKS_IMPORTER_START_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
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
    mode: {
      description: "Import mode.",
      type: "string",
      values: [IMPORTER_IMPORT_CANDLES_MODE, IMPORTER_WARMUP_CACHE_MODE]
    },
    settings: {
      description: "Import settings.",
      type: "object",
      props: IMPORTER_SETTINGS
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

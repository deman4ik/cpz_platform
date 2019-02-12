import { VALID_TIMEFRAMES } from "../../../state/timeframes";
import { BASE_ERROR } from "../base";

const TASKS_IMPORTER_START_EVENT = {
  eventType: "CPZ.Tasks.Importer.Start",

  dataSchema: {
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
    exchange: { description: "Exchange code.", type: "string", empty: false },
    asset: { description: "Base currency.", type: "string", empty: false },
    currency: { description: "Quote currency.", type: "string", empty: false },
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
    // TODO: datefrom/dateto custom validation
    dateFrom: {
      description: "Import start date.",
      type: "datetime"
    },
    dateTo: {
      description: "Import end date.",
      type: "datetime"
    },
    proxy: {
      description: "Proxy endpoint.",
      type: "string",
      optional: true,
      empty: false
    }
  }
};

const TASKS_IMPORTER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Importer.Stop",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

const TASKS_IMPORTER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Importer.Started",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

const TASKS_IMPORTER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Importer.Stoppped",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

const TASKS_IMPORTER_FINISHED_EVENT = {
  eventType: "CPZ.Tasks.Importer.Finished",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

export {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STOP_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_STOPPED_EVENT,
  TASKS_IMPORTER_FINISHED_EVENT
};
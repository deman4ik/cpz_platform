import { VALID_TIMEFRAMES } from "../../../state/timeframes";
import { BASE_ERROR } from "../base";
import { CANDLEBATCHER_SETTINGS } from "../settings";

const TASKS_CANDLEBATCHER_START_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Start",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
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
      description: "List of timeframes in minutes.",
      type: "array",
      items: "number",
      enum: VALID_TIMEFRAMES
    },
    settings: {
      description: "Candlebatcher settings.",
      type: "object",
      props: CANDLEBATCHER_SETTINGS
    }
  }
};
const TASKS_CANDLEBATCHER_STOP_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Stop",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  }
};

const TASKS_CANDLEBATCHER_UPDATE_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Update",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    settings: {
      description: "Candlebatcher settings.",
      type: "object",
      props: CANDLEBATCHER_SETTINGS
    }
  }
};
const TASKS_CANDLEBATCHER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Started",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_CANDLEBATCHER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Stopped",

  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_CANDLEBATCHER_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.Candlebatcher.Updated",

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
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT,
  TASKS_CANDLEBATCHER_UPDATED_EVENT
};

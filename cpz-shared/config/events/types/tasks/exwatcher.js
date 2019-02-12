import { VALID_TIMEFRAMES } from "../../../state/timeframes";
import { BASE_ERROR } from "../base";
import { CANDLEBATCHER_SETTINGS } from "../settings";

const EXWATCHER_START_PARAMS = {
  exchange: { description: "Exchange code.", type: "string", empty: false },
  asset: { description: "Base currency.", type: "string", empty: false },
  currency: { description: "Quote currency.", type: "string", empty: false },
  timeframes: {
    description: "List of timeframes in minutes.",
    type: "array",
    items: "number",
    enum: VALID_TIMEFRAMES,
    optional: true
  },
  marketwatcherProviderType: {
    description: "Marketwatcher data provider type.",
    type: "string",
    values: ["сryptoсompare"],
    optional: true
  },
  candlebatcherProviderType: {
    description: "Candlebatcher data provider type.",
    type: "string",
    values: ["ccxt"],
    optional: true
  },
  candlebatcherSettings: {
    description: "Candlebatcher settings.",
    type: "object",
    props: CANDLEBATCHER_SETTINGS,
    optional: true
  }
};

const EXWATCHER_STOP_PARAMS = {
  taskId: {
    description: "Uniq watcher id.",
    type: "string",
    empty: false
  }
};

const EXWATCHER_UPDATE_PARAMS = {
  taskId: {
    description: "Uniq watcher id.",
    type: "string",
    empty: false
  },
  candlebatcherSettings: {
    description: "Candlebatcher settings.",
    type: "object",
    props: CANDLEBATCHER_SETTINGS
  }
};

const TASKS_EXWATCHER_STARTED_EVENT = {
  eventType: "CPZ.Tasks.Exwatcher.Started",
  dataSchema: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

const TASKS_EXWATCHER_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.Exwatcher.Stopped",
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
  EXWATCHER_START_PARAMS,
  EXWATCHER_STOP_PARAMS,
  EXWATCHER_UPDATE_PARAMS,
  TASKS_EXWATCHER_STARTED_EVENT,
  TASKS_EXWATCHER_STOPPED_EVENT
};

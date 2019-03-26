import { VALID_TIMEFRAMES } from "../../../config/state/timeframes";
import { BASE_ERROR } from "../base";
import { CANDLEBATCHER_SETTINGS } from "../settings";
import {
  EXWATCHER_START,
  EXWATCHER_STOP,
  EXWATCHER_UPDATE,
  TASKS_EXWATCHER_STARTED_EVENT,
  TASKS_EXWATCHER_STOPPED_EVENT,
  TASKS_EXWATCHER_UPDATED_EVENT
} from "../../types/tasks/exwatcher";

const EXWATCHER_START_SCHEMA = {
  [EXWATCHER_START]: {
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
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
  }
};
const EXWATCHER_STOP_SCHEMA = {
  [EXWATCHER_STOP]: {
    taskId: {
      description: "Uniq watcher id.",
      type: "string",
      empty: false
    }
  }
};
const EXWATCHER_UPDATE_SCHEMA = {
  [EXWATCHER_UPDATE]: {
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
  }
};
const TASKS_EXWATCHER_STARTED_EVENT_SCHEMA = {
  [TASKS_EXWATCHER_STARTED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_EXWATCHER_STOPPED_EVENT_SCHEMA = {
  [TASKS_EXWATCHER_STOPPED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};
const TASKS_EXWATCHER_UPDATED_EVENT_SCHEMA = {
  [TASKS_EXWATCHER_UPDATED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

export {
  EXWATCHER_START_SCHEMA,
  EXWATCHER_STOP_SCHEMA,
  EXWATCHER_UPDATE_SCHEMA,
  TASKS_EXWATCHER_STARTED_EVENT_SCHEMA,
  TASKS_EXWATCHER_STOPPED_EVENT_SCHEMA,
  TASKS_EXWATCHER_UPDATED_EVENT_SCHEMA
};

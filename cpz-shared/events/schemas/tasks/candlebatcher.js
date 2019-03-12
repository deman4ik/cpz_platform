import { VALID_TIMEFRAMES } from "../../../config/state/timeframes";
import { BASE_ERROR } from "../base";
import { CANDLEBATCHER_SETTINGS } from "../settings";
import {
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT,
  TASKS_CANDLEBATCHER_UPDATED_EVENT
} from "../../types/tasks/candlebatcher";

const TASKS_CANDLEBATCHER_EVENTS = {
  [TASKS_CANDLEBATCHER_START_EVENT]: {
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
  },
  [TASKS_CANDLEBATCHER_STOP_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  },
  [TASKS_CANDLEBATCHER_UPDATE_EVENT]: {
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
  },
  [TASKS_CANDLEBATCHER_STARTED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  },
  [TASKS_CANDLEBATCHER_STOPPED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  },
  [TASKS_CANDLEBATCHER_UPDATED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

export default TASKS_CANDLEBATCHER_EVENTS;

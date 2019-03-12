import { BASE_ERROR } from "../base";
import { TRADER_SETTINGS } from "../settings";
import {
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TASKS_TRADER_UPDATED_EVENT
} from "../../types/tasks/trader";

const TASKS_TRADER_EVENTS = {
  [TASKS_TRADER_START_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id. - 'AdvisorName'",
      type: "int",
      empty: false
    },
    userId: {
      description: "User uniq Id.",
      type: "uuid",
      empty: false
    },
    exchange: { description: "Exchange code.", type: "exchange" },
    asset: { description: "Base currency.", type: "currency" },
    currency: { description: "Quote currency.", type: "currency" },
    timeframe: {
      description: "Timeframe in minutes.",
      type: "int"
    },
    settings: {
      description: "Trader settings.",
      type: "object",
      props: TRADER_SETTINGS
    }
  },
  [TASKS_TRADER_STOP_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    }
  },
  [TASKS_TRADER_UPDATE_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    settings: {
      description: "Trader settings.",
      type: "object",
      props: TRADER_SETTINGS
    }
  },
  [TASKS_TRADER_STARTED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  },
  [TASKS_TRADER_STOPPED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  },
  [TASKS_TRADER_UPDATED_EVENT]: {
    taskId: {
      description: "Uniq task id.",
      type: "string",
      empty: false
    },
    error: BASE_ERROR
  }
};

export default TASKS_TRADER_EVENTS;

import { BASE_ERROR } from "../base";
import {
  CANDLEBATCHER_SETTINGS,
  ADVISER_SETTINGS,
  TRADER_SETTINGS
} from "../settings";
import {
  USER_ROBOT_START,
  USER_ROBOT_STOP,
  USER_ROBOT_UPDATE,
  TASKS_USERROBOT_HIST_EVENT
} from "../../types/tasks/userRobot";
import { VALID_TIMEFRAMES } from "../../../config/state/timeframes";

/**
 * Событие - Робот запущен
 */
const USER_ROBOT_START_SCHEMA = {
  [USER_ROBOT_START]: {
    id: {
      description: "Uniq user robot id.",
      type: "string",
      empty: false
    },
    robotId: {
      description: "Robot uniq Id.",
      type: "number",
      integer: true
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
      type: "enum",
      values: VALID_TIMEFRAMES
    },
    strategyName: {
      description: "Strategy file name.",
      type: "string",
      empty: false
    },
    candlebatcherSettings: {
      description: "Candlebatcher settings.",
      type: "object",
      props: CANDLEBATCHER_SETTINGS,
      optional: true
    },
    adviserSettings: {
      description: "Adviser settings.",
      type: "object",
      props: ADVISER_SETTINGS,
      optional: true
    },
    traderSettings: {
      description: "Trader settings.",
      type: "object",
      props: TRADER_SETTINGS,
      optional: true
    }
  }
};
const USER_ROBOT_STOP_SCHEMA = {
  [USER_ROBOT_STOP]: {
    id: {
      description: "Uniq user robot id.",
      type: "string",
      empty: false
    }
  }
};
const USER_ROBOT_UPDATE_SCHEMA = {
  [USER_ROBOT_UPDATE]: {
    traderSettings: {
      description: "Trader settings.",
      type: "object",
      props: TRADER_SETTINGS
    }
  }
};
const TASKS_USERROBOT_HIST_EVENT_SCHEMA = {
  [TASKS_USERROBOT_HIST_EVENT]: {
    id: {
      description: "Uniq user robot id.",
      type: "string",
      empty: false
    },
    candlebatcherSettings: {
      description: "Candlebatcher settings.",
      type: "object",
      props: CANDLEBATCHER_SETTINGS,
      optional: true
    },
    adviserSettings: {
      description: "Adviser settings.",
      type: "object",
      props: ADVISER_SETTINGS,
      optional: true
    },
    traderSettings: {
      description: "Trader settings.",
      type: "object",
      props: TRADER_SETTINGS,
      optional: true
    },
    action: { description: "Current action.", type: "string", empty: false },
    startedAt: {
      description: "Robot start date.",
      type: "datetime",
      optional: true
    },
    stoppeddAt: {
      description: "Robot stop date.",
      type: "datetime",
      optional: true
    },
    error: BASE_ERROR
  }
};

export {
  USER_ROBOT_START_SCHEMA,
  USER_ROBOT_STOP_SCHEMA,
  USER_ROBOT_UPDATE_SCHEMA,
  TASKS_USERROBOT_HIST_EVENT_SCHEMA
};

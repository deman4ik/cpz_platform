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
  TASKS_USERROBOT_STARTED_EVENT,
  TASKS_USERROBOT_STOPPED_EVENT,
  TASKS_USERROBOT_UPDATED_EVENT
} from "../../types/tasks/userRobot";

const USER_ROBOT_START_PARAMS = {
  id: {
    description: "Uniq user robot id.",
    type: "string",
    empty: false
  },
  robotId: {
    description: "Robot uniq Id.",
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
};

const USER_ROBOT_STOP_PARAMS = {
  id: {
    description: "Uniq user robot id.",
    type: "string",
    empty: false
  }
};

const USER_ROBOT_UPDATE_PARAMS = {
  id: {
    description: "Uniq user robot id.",
    type: "string",
    empty: false
  },
  traderSettings: {
    description: "Trader settings.",
    type: "object",
    props: TRADER_SETTINGS
  }
};

/**
 * Событие - Робот запущен
 */
const USER_ROBOT_START_SCHEMA = {
  [USER_ROBOT_START]: USER_ROBOT_START_PARAMS
};
const USER_ROBOT_STOP_SCHEMA = {
  [USER_ROBOT_STOP]: USER_ROBOT_STOP_PARAMS
};
const USER_ROBOT_UPDATE_SCHEMA = {
  [USER_ROBOT_UPDATE]: USER_ROBOT_UPDATE_PARAMS
};
const TASKS_USERROBOT_STARTED_EVENT_SCHEMA = {
  [TASKS_USERROBOT_STARTED_EVENT]: {
    ...USER_ROBOT_START_PARAMS,
    status: { description: "Current status.", type: "string", empty: false },
    startedAt: {
      description: "Robot start date.",
      type: "datetime"
    },
    error: BASE_ERROR
  }
};
const TASKS_USERROBOT_STOPPED_EVENT_SCHEMA = {
  [TASKS_USERROBOT_STOPPED_EVENT]: {
    ...USER_ROBOT_STOP_PARAMS,
    status: { description: "Current status.", type: "string", empty: false },
    stoppeddAt: {
      description: "Robot stop date.",
      type: "datetime"
    },
    error: BASE_ERROR
  }
};
const TASKS_USERROBOT_UPDATED_EVENT_SCHEMA = {
  [TASKS_USERROBOT_UPDATED_EVENT]: {
    ...USER_ROBOT_UPDATE_PARAMS,
    status: { description: "Current status.", type: "string", empty: false },
    error: BASE_ERROR
  }
};

export {
  USER_ROBOT_START_SCHEMA,
  USER_ROBOT_STOP_SCHEMA,
  USER_ROBOT_UPDATE_SCHEMA,
  TASKS_USERROBOT_STARTED_EVENT_SCHEMA,
  TASKS_USERROBOT_STOPPED_EVENT_SCHEMA,
  TASKS_USERROBOT_UPDATED_EVENT_SCHEMA
};

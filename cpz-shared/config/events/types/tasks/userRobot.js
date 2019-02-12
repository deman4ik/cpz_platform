import { BASE_ERROR } from "../base";
import {
  CANDLEBATCHER_SETTINGS,
  ADVISER_SETTINGS,
  TRADER_SETTINGS
} from "../settings";

const USER_ROBOT_START_PARAMS = {
  id: {
    description: "Uniq user robot id.",
    type: "string",
    empty: false
  },
  robotId: {
    description: "Robot uniq Id.",
    type: "number",
    empty: false
  },
  userId: {
    description: "User uniq Id.",
    type: "string",
    empty: false
  },
  exchange: { description: "Exchange code.", type: "string", empty: false },
  asset: { description: "Base currency.", type: "string", empty: false },
  currency: { description: "Quote currency.", type: "string", empty: false },
  timeframe: {
    description: "Timeframe in minutes.",
    type: "number"
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
const TASKS_USERROBOT_STARTED_EVENT = {
  eventType: "CPZ.Tasks.UserRobot.Started",

  dataSchema: {
    ...USER_ROBOT_START_PARAMS,
    status: { description: "Current status.", type: "string", empty: false },
    startedAt: {
      description: "Robot start date.",
      type: "datetime"
    },
    error: BASE_ERROR
  }
};

/**
 * Событие - Робот остановлен
 */
const TASKS_USERROBOT_STOPPED_EVENT = {
  eventType: "CPZ.Tasks.UserRobot.Stopped",

  dataSchema: {
    ...USER_ROBOT_STOP_PARAMS,
    status: { description: "Current status.", type: "string", empty: false },
    stoppeddAt: {
      description: "Robot stop date.",
      type: "datetime"
    },
    error: BASE_ERROR
  }
};

/**
 * Событие - Параметры робота обновлены
 */
const TASKS_USERROBOT_UPDATED_EVENT = {
  eventType: "CPZ.Tasks.UserRobot.Updated",

  dataSchema: {
    ...USER_ROBOT_UPDATE_PARAMS,
    status: { description: "Current status.", type: "string", empty: false },
    error: BASE_ERROR
  }
};

export {
  USER_ROBOT_START_PARAMS,
  USER_ROBOT_STOP_PARAMS,
  USER_ROBOT_UPDATE_PARAMS,
  TASKS_USERROBOT_STARTED_EVENT,
  TASKS_USERROBOT_STOPPED_EVENT,
  TASKS_USERROBOT_UPDATED_EVENT
};

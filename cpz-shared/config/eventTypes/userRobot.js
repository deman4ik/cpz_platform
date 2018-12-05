import {
  CANDLEBATCHER_SETTINGS,
  ADVISER_SETTINGS,
  TRADER_SETTINGS
} from "./settings";

const USER_ROBOT_START_PARAMS = {
  id: {
    description: "Uniq user robot id.",
    type: "string",
    empty: false
  },
  robotId: {
    description: "Robot uniq Id. - 'AdvisorName'",
    type: "string",
    empty: false
  },
  userId: {
    description: "User uniq Id.",
    type: "string",
    empty: false
  },
  mode: {
    description: "Service run mode.",
    type: "string",
    values: ["emulator", "realtime"]
  },
  exchange: { description: "Exchange code.", type: "string", empty: false },
  asset: { description: "Base currency.", type: "string", empty: false },
  currency: { description: "Quote currency.", type: "string", empty: false },
  timeframe: {
    description: "Timeframe in minutes.",
    type: "number"
  },
  candlebatcherSettings: CANDLEBATCHER_SETTINGS,
  adviserSettings: ADVISER_SETTINGS,
  traderSettings: TRADER_SETTINGS
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
  traderSettings: TRADER_SETTINGS
};

export {
  USER_ROBOT_START_PARAMS,
  USER_ROBOT_STOP_PARAMS,
  USER_ROBOT_UPDATE_PARAMS
};

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
  strategyName: {
    description: "Strategy file name.",
    type: "string",
    empty: false
  },
  candlebatcherSettings: {
    description: "Candlebatcher settings.",
    type: "object",
    props: CANDLEBATCHER_SETTINGS
  },
  adviserSettings: {
    description: "Adviser settings.",
    type: "object",
    props: ADVISER_SETTINGS
  },
  traderSettings: {
    description: "Trader settings.",
    type: "object",
    props: TRADER_SETTINGS
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

export {
  USER_ROBOT_START_PARAMS,
  USER_ROBOT_STOP_PARAMS,
  USER_ROBOT_UPDATE_PARAMS
};

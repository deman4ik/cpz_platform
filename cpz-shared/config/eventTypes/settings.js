const CANDLEBATCHER_SETTINGS = {
  debug: {
    description: "Debug mode.",
    type: "boolean",
    optional: true
  },
  proxy: {
    description: "Proxy endpoint.",
    type: "string",
    optional: true,
    empty: false
  },
  requiredHistoryMaxBars: {
    description: "Load history data from cache.",
    type: "number",
    integer: true,
    optional: true
  }
};

const ADVISER_SETTINGS = {
  debug: {
    description: "Debug mode.",
    type: "boolean",
    optional: true
  },
  strategyParameters: {
    description: "Strategy parameters.",
    type: "object",
    optional: true
  },
  requiredHistoryCache: {
    description: "Load history data from cache.",
    type: "boolean",
    optional: true,
    default: true
  },
  requiredHistoryMaxBars: {
    description: "Load history data from cache.",
    type: "number",
    integer: true,
    optional: true
  }
};

const TRADER_SETTINGS = {
  mode: {
    description: "Service run mode.",
    type: "string",
    values: ["emulator", "realtime"],
    optional: true
  },
  debug: {
    description: "Debug mode.",
    type: "boolean",
    optional: true
  },
  slippageStep: {
    description: "Price Slippage Step.",
    type: "number",
    optional: true
  },
  deviation: {
    description: "Price deviation",
    type: "number",
    optional: true
  },
  volume: {
    description: "User trade volume",
    type: "number",
    optional: true
  }
};

const BACKTESTER_SETTINGS = {
  debug: {
    description: "Debug mode.",
    type: "boolean",
    optional: true
  }
};
export {
  CANDLEBATCHER_SETTINGS,
  ADVISER_SETTINGS,
  TRADER_SETTINGS,
  BACKTESTER_SETTINGS
};

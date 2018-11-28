const CANDLEBATCHER_SETTINGS = {
  debug: {
    description: "Debug mode.",
    type: "boolean",
    empty: false,
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
    empty: false,
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
  debug: {
    description: "Debug mode.",
    type: "boolean",
    empty: false,
    optional: true
  },
  slippageStep: {
    description: "Price Slippage Step.",
    type: "number",
    empty: false,
    optional: true
  },
  deviation: {
    description: "Price deviation",
    type: "number",
    empty: false,
    optional: true
  },
  volume: {
    description: "User trade volume",
    type: "number",
    empty: false,
    optional: true
  }
};

const BACKTESTER_SETTINGS = {
  debug: {
    description: "Debug mode.",
    type: "boolean",
    empty: false,
    optional: true
  }
};
export {
  CANDLEBATCHER_SETTINGS,
  ADVISER_SETTINGS,
  TRADER_SETTINGS,
  BACKTESTER_SETTINGS
};

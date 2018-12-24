const CANDLEBATCHER_SETTINGS_DEFAULTS = {
  debug: false,
  proxy: process.env.PROXY_ENDPOINT,
  requiredHistoryMaxBars: 100
};

const ADVISER_SETTINGS_DEFAULTS = {
  debug: false,
  strategyParameters: {},
  requiredHistoryCache: true,
  requiredHistoryMaxBars: 100
};

const TRADER_SETTINGS_DEFAULTS = {
  debug: false,
  openOrderTimeout: 10, // minutes
  slippageStep: 0,
  deviation: 0,
  volume: 1
};

const BACKTESTER_SETTINGS_DEFAULTS = {
  debug: false
};
export {
  CANDLEBATCHER_SETTINGS_DEFAULTS,
  ADVISER_SETTINGS_DEFAULTS,
  TRADER_SETTINGS_DEFAULTS,
  BACKTESTER_SETTINGS_DEFAULTS
};

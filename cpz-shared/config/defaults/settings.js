import { EMULATOR_MODE } from "../state";

const CANDLEBATCHER_SETTINGS_DEFAULTS = {
  debug: true,
  proxy: process.env.PROXY_ENDPOINT,
  requiredHistoryMaxBars: 1
};

const ADVISER_SETTINGS_DEFAULTS = {
  debug: true,
  strategyParameters: {},
  requiredHistoryCache: true,
  requiredHistoryMaxBars: 30
};

const TRADER_SETTINGS_DEFAULTS = {
  debug: true,
  mode: EMULATOR_MODE,
  openOrderTimeout: 10, // minutes
  slippageStep: 0,
  deviation: 0,
  volume: 0.002,
  multiPosition: false
};

const BACKTESTER_SETTINGS_DEFAULTS = {
  debug: true
};
export {
  CANDLEBATCHER_SETTINGS_DEFAULTS,
  ADVISER_SETTINGS_DEFAULTS,
  TRADER_SETTINGS_DEFAULTS,
  BACKTESTER_SETTINGS_DEFAULTS
};

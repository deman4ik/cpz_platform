import { EMULATOR_MODE } from "../state";
import dayjs from "../../utils/dayjs";

const CANDLEBATCHER_SETTINGS_DEFAULTS = {
  debug: process.env.DEBUG || false,
  proxy: process.env.PROXY_ENDPOINT,
  requiredHistoryMaxBars: 500
};

const IMPORTER_SETTINGS_DEFAULT = {
  debug: process.env.DEBUG || false,
  importCandles: {
    dateFrom: dayjs
      .utc()
      .startOf("day")
      .toISOString(),
    dateTo: dayjs
      .utc()
      .startOf("minute")
      .toISOString(),
    proxy: process.env.PROXY_ENDPOINT,
    providerType: "ccxt",
    requireBatching: true,
    saveToCache: false
  },
  warmupCache: {
    barsToCache: CANDLEBATCHER_SETTINGS_DEFAULTS.requiredHistoryMaxBars / 2
  }
};

const ADVISER_SETTINGS_DEFAULTS = {
  debug: process.env.DEBUG || false,
  strategyParameters: {},
  requiredHistoryCache: true,
  requiredHistoryMaxBars:
    CANDLEBATCHER_SETTINGS_DEFAULTS.requiredHistoryMaxBars / 2
};

const TRADER_SETTINGS_DEFAULTS = {
  debug: process.env.DEBUG || false,
  mode: EMULATOR_MODE,
  openOrderTimeout: 10, // minutes
  slippageStep: 0,
  deviation: 0,
  volume: 0.002,
  multiPosition: false,
  defaultLeverage: 2
};

const BACKTESTER_SETTINGS_DEFAULTS = {
  debug: process.env.DEBUG || false,
  local: false,
  trace: false,
  saveCandlesCSV: false,
  saveToStorage: false,
  saveToDB: true
};
export {
  IMPORTER_SETTINGS_DEFAULT,
  CANDLEBATCHER_SETTINGS_DEFAULTS,
  ADVISER_SETTINGS_DEFAULTS,
  TRADER_SETTINGS_DEFAULTS,
  BACKTESTER_SETTINGS_DEFAULTS
};

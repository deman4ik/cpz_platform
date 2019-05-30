import {
  IMPORTER_SETTINGS_DEFAULT,
  ADVISER_SETTINGS_DEFAULTS,
  CANDLEBATCHER_SETTINGS_DEFAULTS,
  TRADER_SETTINGS_DEFAULTS,
  BACKTESTER_SETTINGS_DEFAULTS
} from "../config/defaults";
import dayjs from "./dayjs";

const combineImporterSettings = props => {
  const settings = props || { importCandles: {}, warmupCache: {} };
  return {
    /* Режима дебага [true,false] */
    debug:
      settings.debug === undefined || settings.debug === null
        ? IMPORTER_SETTINGS_DEFAULT.debug
        : settings.debug,
    /* Адрес прокси сервера */
    importCandles: {
      dateFrom:
        settings.importCandles && settings.importCandles.dateFrom
          ? dayjs
              .utc(settings.importCandles.dateFrom)
              .startOf("day")
              .toISOString()
          : IMPORTER_SETTINGS_DEFAULT.importCandles.dateFrom,
      dateTo:
        settings.importCandles &&
        dayjs
          .utc(settings.importCandles.dateTo)
          .startOf("minute")
          .valueOf() <
          dayjs
            .utc()
            .startOf("minute")
            .valueOf()
          ? dayjs
              .utc(settings.importCandles.dateTo)
              .startOf("minute")
              .toISOString()
          : IMPORTER_SETTINGS_DEFAULT.importCandles.dateTo,
      proxy:
        (settings.importCandles && settings.importCandles.proxy) ||
        IMPORTER_SETTINGS_DEFAULT.importCandles.proxy,
      mode:
        (settings.importCandles && settings.importCandles.mode) ||
        IMPORTER_SETTINGS_DEFAULT.importCandles.mode,
      providerType:
        (settings.importCandles && settings.importCandles.providerType) ||
        IMPORTER_SETTINGS_DEFAULT.importCandles.providerType,
      requireBatching:
        (settings.importCandles && settings.importCandles.requireBatching) ||
        IMPORTER_SETTINGS_DEFAULT.importCandles.requireBatching,
      saveToCache:
        (settings.importCandles && settings.importCandles.saveToCache) ||
        IMPORTER_SETTINGS_DEFAULT.importCandles.saveToCache
    },
    warmupCache: {
      barsToCache:
        (settings.warmupCache && settings.warmupCache.barsToCache) ||
        IMPORTER_SETTINGS_DEFAULT.warmupCache.barsToCache
    }
  };
};

const combineAdviserSettings = props => {
  const settings = props || {};
  return {
    /* Режима дебага [true,false] */
    debug:
      settings.debug === undefined || settings.debug === null
        ? ADVISER_SETTINGS_DEFAULTS.debug
        : settings.debug,
    strategyParameters:
      settings.strategyParameters ||
      ADVISER_SETTINGS_DEFAULTS.strategyParameters,
    /* Загружать историю из кэша */
    requiredHistoryCache:
      settings.requiredHistoryCache === undefined ||
      settings.requiredHistoryCache === null
        ? ADVISER_SETTINGS_DEFAULTS.requiredHistoryCache
        : settings.requiredHistoryCache,

    /* Максимально количество свечей в кэше */
    requiredHistoryMaxBars:
      settings.requiredHistoryMaxBars ||
      ADVISER_SETTINGS_DEFAULTS.requiredHistoryMaxBars
  };
};

const combineCandlebatcherSettings = props => {
  const settings = props || {};
  return {
    /* Режима дебага [true,false] */
    debug:
      settings.debug === undefined || settings.debug === null
        ? CANDLEBATCHER_SETTINGS_DEFAULTS.debug
        : settings.debug,
    /* Адрес прокси сервера */
    proxy: settings.proxy || CANDLEBATCHER_SETTINGS_DEFAULTS.proxy,
    requiredHistoryMaxBars:
      settings.requiredHistoryMaxBars ||
      CANDLEBATCHER_SETTINGS_DEFAULTS.requiredHistoryMaxBars
  };
};

const combineTraderSettings = props => {
  const settings = props || {};
  return {
    /* Режима дебага [true,false] */
    debug:
      settings.debug === undefined || settings.debug === null
        ? TRADER_SETTINGS_DEFAULTS.debug
        : settings.debug,
    mode: settings.mode || TRADER_SETTINGS_DEFAULTS.mode,
    /* Шаг проскальзывания */
    slippageStep:
      settings.slippageStep || TRADER_SETTINGS_DEFAULTS.slippageStep,
    /* Отклонение цены */
    deviation: settings.deviation || TRADER_SETTINGS_DEFAULTS.deviation,
    /* Объем */
    volume: settings.volume || TRADER_SETTINGS_DEFAULTS.volume,
    /* Order execution timeout */
    openOrderTimeout:
      settings.openOrderTimeout || TRADER_SETTINGS_DEFAULTS.openOrderTimeout,
    /* Режима работы с несколькими активными позициями */
    multiPosition:
      settings.multiPosition === undefined || settings.multiPosition === null
        ? TRADER_SETTINGS_DEFAULTS.multiPosition
        : settings.multiPosition,
    /* Плечо  */
    defaultLeverage:
      settings.defaultLeverage || TRADER_SETTINGS_DEFAULTS.defaultLeverage,
    /* Информация о API ключах */
    keys: settings.keys
  };
};

const combineBacktesterSettings = props => {
  const settings = props || {};
  return {
    debug:
      settings.debug === undefined || settings.debug === null
        ? BACKTESTER_SETTINGS_DEFAULTS.debug
        : settings.debug,
    local:
      settings.local === undefined || settings.local === null
        ? BACKTESTER_SETTINGS_DEFAULTS.local
        : settings.local,
    trace:
      settings.trace === undefined || settings.trace === null
        ? BACKTESTER_SETTINGS_DEFAULTS.trace
        : settings.trace,
    saveCandlesCSV:
      settings.saveCandlesCSV === undefined || settings.saveCandlesCSV === null
        ? BACKTESTER_SETTINGS_DEFAULTS.saveCandlesCSV
        : settings.saveCandlesCSV,
    saveToStorage:
      settings.saveToStorage === undefined || settings.saveToStorage === null
        ? BACKTESTER_SETTINGS_DEFAULTS.saveToStorage
        : settings.saveToStorage,
    saveToDB:
      settings.saveToDB === undefined || settings.saveToDB === null
        ? BACKTESTER_SETTINGS_DEFAULTS.saveToDB
        : settings.saveToDB
  };
};

export {
  combineImporterSettings,
  combineAdviserSettings,
  combineCandlebatcherSettings,
  combineTraderSettings,
  combineBacktesterSettings
};

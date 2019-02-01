import {
  ADVISER_SETTINGS_DEFAULTS,
  CANDLEBATCHER_SETTINGS_DEFAULTS,
  TRADER_SETTINGS_DEFAULTS
} from "../config/defaults";

const combineAdvserSettings = settings => ({
  /* Режима дебага [true,false] */
  debug:
    settings.debug === undefined || settings.debug === null
      ? ADVISER_SETTINGS_DEFAULTS.debug
      : settings.debug,
  strategyParameters:
    settings.strategyParameters || ADVISER_SETTINGS_DEFAULTS.strategyParameters,
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
});

const combineCandlebatcherSettings = settings => ({
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
});

const combineTraderSettings = settings => ({
  /* Режима дебага [true,false] */
  debug:
    settings.debug === undefined || settings.debug === null
      ? TRADER_SETTINGS_DEFAULTS.debug
      : settings.debug,
  mode: settings.mode || TRADER_SETTINGS_DEFAULTS.mode,
  /* Шаг проскальзывания */
  slippageStep: settings.slippageStep || TRADER_SETTINGS_DEFAULTS.slippageStep,
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
  /* Информация о API ключах */
  keys: settings.keys
});
export {
  combineAdvserSettings,
  combineCandlebatcherSettings,
  combineTraderSettings
};

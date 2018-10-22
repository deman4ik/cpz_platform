/**
 * Режим запуска сервиса
 */
const REALTIME_MODE = "realtime"; // в реальном времени (текущие данные с биржи, выставление реальных ордеров на биржу)
const EMULATOR_MODE = "emulator"; // эмуляция (текущие данные с биржи, эмуляция реальной торговли)
const BACKTEST_MODE = "backtest"; // бэктест (исторические данные, эмуляция реальной торговли)

/**
 * Торговое действие
 */
const TRADE_ACTION_LONG = "long"; // открыть длинную позицию - покупаем
const TRADE_ACTION_CLOSE_LONG = "closeLong"; // закрыть длинную позицию - продаем
const TRADE_ACTION_SHORT = "short"; // открыть коротку позицию - продаем
const TRADE_ACTION_CLOSE_SHORT = "closeShort"; // закрыть коротку позицию - покупаем

/**
 * Тип ордера
 */
const ORDER_TYPE_LIMIT = "limit"; // лимитный ордер
const ORDER_TYPE_MARKET = "market"; // рыночной ордер
const ORDER_TYPE_STOP = "stop"; // стоп ордер

/**
 * Направление торговли ордера
 */
const ORDER_DIRECTION_BUY = "buy"; // покупка
const ORDER_DIRECTION_SELL = "sell"; // продажа

/**
 * Место ордера в позиции
 */
const ORDER_POS_DIR_ENTRY = "entry"; // ордер открывает позицию
const ORDER_POS_DIR_EXIT = "exit"; // ордер закрывает позицию

export {
  REALTIME_MODE,
  EMULATOR_MODE,
  BACKTEST_MODE,
  TRADE_ACTION_LONG,
  TRADE_ACTION_CLOSE_LONG,
  TRADE_ACTION_SHORT,
  TRADE_ACTION_CLOSE_SHORT,
  ORDER_TYPE_LIMIT,
  ORDER_TYPE_MARKET,
  ORDER_TYPE_STOP,
  ORDER_DIRECTION_BUY,
  ORDER_DIRECTION_SELL,
  ORDER_POS_DIR_ENTRY,
  ORDER_POS_DIR_EXIT
};

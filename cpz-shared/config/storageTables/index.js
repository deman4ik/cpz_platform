/**
 * Таблицы Azure Table Storage
 */
const STORAGE_CANDLESCACHED_TABLE = "CandlesCached"; // Кэш текущих свечей

const STORAGE_ADVISERS_TABLE = "Advisers"; // Советники
const STORAGE_CANDLESPENDING_TABLE = "CandlesPending"; // Свечи ожидающие обработки советниками

const STORAGE_TRADERS_TABLE = "Traders"; // Проторговщики
const STORAGE_SIGNALSPENDING_TABLE = "SignalsPending"; // Сигналы ожидающие обработки проторговщиками
const STORAGE_POSITIONS_TABLE = "Positions"; // Позиции

const STORAGE_BACKTESTS_TABLE = "Backtests"; // Бэктестеры
const STORAGE_BACKTESTITEMS_TABLE = "BacktestItems"; // Элементы бэктестов

export {
  STORAGE_ADVISERS_TABLE,
  STORAGE_TRADERS_TABLE,
  STORAGE_POSITIONS_TABLE,
  STORAGE_BACKTESTS_TABLE,
  STORAGE_BACKTESTITEMS_TABLE,
  STORAGE_CANDLESCACHED_TABLE,
  STORAGE_CANDLESPENDING_TABLE,
  STORAGE_SIGNALSPENDING_TABLE
};

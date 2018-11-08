/**
 * Таблицы Azure Table Storage
 */

const STORAGE_TICKSCACHED_TABLE = "TicksCashed"; // Кэш текущих свечей
const STORAGE_MARKETWATCHERS_TABLE = "Marketwatchers"; // Наблюдатели за рынком

const STORAGE_CANDLEBATCHERS_TABLE = "Candlebatchers"; // Преобразователи свечей
const STORAGE_IMPORTERS_TABLE = "Importers"; // Импортеры
const STORAGE_CANDLESCACHED_TABLE = "CandlesCached"; // Кэш текущих свечей
const STORAGE_CANDLESTEMP_TABLE = "CandlesTemp"; // Временные свечи

const STORAGE_ADVISERS_TABLE = "Advisers"; // Советники
const STORAGE_CANDLESPENDING_TABLE = "CandlesPending"; // Свечи ожидающие обработки советниками

const STORAGE_TRADERS_TABLE = "Traders"; // Проторговщики
const STORAGE_SIGNALSPENDING_TABLE = "SignalsPending"; // Сигналы ожидающие обработки проторговщиками
const STORAGE_POSITIONS_TABLE = "Positions"; // Позиции

const STORAGE_BACKTESTS_TABLE = "Backtests"; // Бэктестеры
const STORAGE_BACKTESTITEMS_TABLE = "BacktestItems"; // Элементы бэктестов

export {
  STORAGE_TICKSCACHED_TABLE,
  STORAGE_MARKETWATCHERS_TABLE,
  STORAGE_CANDLEBATCHERS_TABLE,
  STORAGE_IMPORTERS_TABLE,
  STORAGE_ADVISERS_TABLE,
  STORAGE_TRADERS_TABLE,
  STORAGE_POSITIONS_TABLE,
  STORAGE_BACKTESTS_TABLE,
  STORAGE_BACKTESTITEMS_TABLE,
  STORAGE_CANDLESCACHED_TABLE,
  STORAGE_CANDLESTEMP_TABLE,
  STORAGE_CANDLESPENDING_TABLE,
  STORAGE_SIGNALSPENDING_TABLE
};

/**
 * Azure Table Storage - Tables List
 */

const STORAGE_ADVISERS_TABLE = "Advisers"; // Adviser
const STORAGE_BACKTESTS_TABLE = "Backtests"; // Backtester
const STORAGE_BACKTESTITEMS_TABLE = "BacktestItems"; // Backtester
const STORAGE_BACKTESTSTRATLOG_TABLE = "BacktestStratLogs"; // Backtester
const STORAGE_BACKTESTSIGNALS_TABLE = "BacktestSignals"; // Backtester
const STORAGE_BACKTESTORDERS_TABLE = "BacktestOrders"; // Backtester
const STORAGE_BACKTESTPOSITIONS_TABLE = "BacktestPositions"; // Backtester
const STORAGE_CANDLEBATCHERS_TABLE = "Candlebatchers"; // Candlebatcher
const STORAGE_CANDLESCACHED_TABLE = "CandlesCached"; // Candlebatcher / Adviser
const STORAGE_CANDLESTEMP_TABLE = "CandlesTemp"; // Importer
const STORAGE_CANDLESPENDING_TABLE = "CandlesPending"; // Candlebatcher
const STORAGE_IMPORTERS_TABLE = "Importers"; // Importer
const STORAGE_MARKETWATCHERS_TABLE = "Marketwatchers"; // Marketwatcher
const STORAGE_POSITIONS_TABLE = "Positions"; // Trader
const STORAGE_SIGNALSPENDING_TABLE = "SignalsPending"; // Trader
const STORAGE_TICKSCACHED_TABLE = "TicksCashed"; // Marketwatcher / Adviser
const STORAGE_TRADERS_TABLE = "Traders"; // Trader
const STORAGE_USERROBOTS_TABLE = "UserRobots";

const STORAGE_TASKS_EVENTS_TABLE = "TasksEvents";
const STORAGE_SIGNALS_EVENTS_TABLE = "SignalsEvents";
const STORAGE_ORDERS_EVENTS_TABLE = "OrdersEvents";
const STORAGE_POSITIONS_EVENTS_TABLE = "PositionsEvents";
const STORAGE_LOGS_EVENTS_TABLE = "LogEvents";
const STORAGE_ERRORS_EVENTS_TABLE = "ErrorEvents";

export {
  STORAGE_ADVISERS_TABLE,
  STORAGE_BACKTESTS_TABLE,
  STORAGE_BACKTESTITEMS_TABLE,
  STORAGE_BACKTESTSTRATLOG_TABLE,
  STORAGE_BACKTESTSIGNALS_TABLE,
  STORAGE_BACKTESTORDERS_TABLE,
  STORAGE_BACKTESTPOSITIONS_TABLE,
  STORAGE_CANDLEBATCHERS_TABLE,
  STORAGE_CANDLESCACHED_TABLE,
  STORAGE_CANDLESTEMP_TABLE,
  STORAGE_CANDLESPENDING_TABLE,
  STORAGE_IMPORTERS_TABLE,
  STORAGE_MARKETWATCHERS_TABLE,
  STORAGE_POSITIONS_TABLE,
  STORAGE_SIGNALSPENDING_TABLE,
  STORAGE_TICKSCACHED_TABLE,
  STORAGE_TRADERS_TABLE,
  STORAGE_USERROBOTS_TABLE,
  STORAGE_TASKS_EVENTS_TABLE,
  STORAGE_SIGNALS_EVENTS_TABLE,
  STORAGE_ORDERS_EVENTS_TABLE,
  STORAGE_POSITIONS_EVENTS_TABLE,
  STORAGE_LOGS_EVENTS_TABLE,
  STORAGE_ERRORS_EVENTS_TABLE
};

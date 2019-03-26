const EXECUTE_ORDER_ERROR = "ExecutingOrder";

const HANDLING_ORDER_ERROR = "HandlingOrder";

const IMPORT_CANDLES_ERROR = "ImportCandles";

const NOT_IMPL_ERROR = "NotImlementedError";

const USER_ROBOT_ERROR = "UserRobotError";

const KEY_VAULT_ERROR = "KeyVaultError";

const NETWOKR_ERROR = "NetworkError";

const UNKNOWN_ERROR = "UnknownError";

const RETRY_ERROR = "RetryError";

const DB_ERROR = "DBError";

const VALIDATION_ERROR = "ValidationError";

const LOG_ERROR = "LogError";

export * from "./marketwatcher";
export * from "./candlebatcher";
export * from "./backtester";
export * from "./connector";
export * from "./exwatcher";
export * from "./provider";
export * from "./importer";
export * from "./adviser";
export * from "./trader";
export * from "./robots";
export * from "./tulip";
export * from "./task";
export * from "./eventgrid";
export * from "./tableStorage";

export {
  IMPORT_CANDLES_ERROR,
  HANDLING_ORDER_ERROR,
  EXECUTE_ORDER_ERROR,
  USER_ROBOT_ERROR,
  KEY_VAULT_ERROR,
  NOT_IMPL_ERROR,
  UNKNOWN_ERROR,
  NETWOKR_ERROR,
  RETRY_ERROR,
  DB_ERROR,
  VALIDATION_ERROR,
  LOG_ERROR
};

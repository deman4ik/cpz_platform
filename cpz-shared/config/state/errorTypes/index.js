const CRYPTOCOMPARE_STREAMING_ERROR = "CryptocompareStreamingError";

const STORAGE_ENTITY_MUTATION_ERROR = "StorageEntityMutation";

const EVENTGRID_PUBLISH_ERROR = "EventGridPublishError";

const TABLE_STORAGE_ERROR = "TableStorageError";

const CONNECTOR_API_ERROR = "ConnectorAPIError";

const LOAD_API_KEYS_ERROR = "LoadAPIKeysError";

const DELETE_STATE_ERROR = "DeleteStateError";

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

export * from "./marketwatcher";
export * from "./candlebatcher";
export * from "./backtester";
export * from "./connector";
export * from "./exwatcher";
export * from "./provider";
export * from "./position";
export * from "./importer";
export * from "./adviser";
export * from "./trader";
export * from "./robots";
export * from "./tulip";
export * from "./task";

export {
  STORAGE_ENTITY_MUTATION_ERROR,
  CRYPTOCOMPARE_STREAMING_ERROR,
  EVENTGRID_PUBLISH_ERROR,
  IMPORT_CANDLES_ERROR,
  HANDLING_ORDER_ERROR,
  CONNECTOR_API_ERROR,
  LOAD_API_KEYS_ERROR,
  EXECUTE_ORDER_ERROR,
  TABLE_STORAGE_ERROR,
  DELETE_STATE_ERROR,
  USER_ROBOT_ERROR,
  KEY_VAULT_ERROR,
  NOT_IMPL_ERROR,
  UNKNOWN_ERROR,
  NETWOKR_ERROR,
  RETRY_ERROR,
  DB_ERROR
};

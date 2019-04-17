const NOT_IMPLEMENTED_ERROR = "NotImplementedError";

const KEY_VAULT_ERROR = "KeyVaultError";

const NETWOKR_ERROR = "NetworkError";

const UNKNOWN_ERROR = "UnknownError";

const RETRY_ERROR = "RetryError";

const DB_ERROR = "DBError";

const VALIDATION_ERROR = "ValidationError";

const LOG_ERROR = "LogError";

const MAILER_ERROR = "MailerError";

export * from "./marketwatcher";
export * from "./candlebatcher";
export * from "./backtester";
export * from "./connector";
export * from "./provider";
export * from "./importer";
export * from "./adviser";
export * from "./trader";
export * from "./robots";
export * from "./tulip";
export * from "./task";
export * from "./eventgrid";
export * from "./tableStorage";
export * from "./auth";
export * from "./eventslogger";

export {
  KEY_VAULT_ERROR,
  NOT_IMPLEMENTED_ERROR,
  UNKNOWN_ERROR,
  NETWOKR_ERROR,
  RETRY_ERROR,
  DB_ERROR,
  VALIDATION_ERROR,
  LOG_ERROR,
  MAILER_ERROR
};

const NOT_IMPLEMENTED_ERROR = "NotImplementedError";

const KEY_VAULT_ERROR = "KeyVaultError";

const NETWOKR_ERROR = "NetworkError";

const UNKNOWN_ERROR = "UnknownError";

const RETRY_ERROR = "RetryError";

const DB_ERROR = "DBError";

const VALIDATION_ERROR = "ValidationError";

const LOG_ERROR = "LogError";

const MAILER_ERROR = "MailerError";

export * from "./adviser";
export * from "./auth";
export * from "./backtester";
export * from "./candlebatcher";
export * from "./connector";
export * from "./control";
export * from "./eventgrid";
export * from "./eventslogger";
export * from "./importer";
export * from "./marketwatcher";
export * from "./robots";
export * from "./tableStorage";
export * from "./task";
export * from "./trader";
export * from "./tulip";

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

const ERROR_SCHEMA = {
  serviceName: { description: "Service name", type: "string", empty: "false" },
  name: { description: "Error code", type: "string", empty: "false" },
  message: { description: "Error message", type: "string", empty: "false" },
  info: { description: "Error info", type: "object", optional: "true" },
  stack: { description: "Error stack", type: "array", optional: "true" }
};

const ERROR_EVENTS = {
  "CPZ.Adviser.Error": ERROR_SCHEMA,
  "CPZ.Adviser.Warn": ERROR_SCHEMA,
  "CPZ.Backtest.Error": ERROR_SCHEMA,
  "CPZ.Backtest.Warn": ERROR_SCHEMA,
  "CPZ.Backtester.Error": ERROR_SCHEMA,
  "CPZ.Backtester.Warn": ERROR_SCHEMA,
  "CPZ.Candlebatcher.Error": ERROR_SCHEMA,
  "CPZ.Candlebatcher.Warn": ERROR_SCHEMA,
  "CPZ.Control.Error": ERROR_SCHEMA,
  "CPZ.Control.Warn": ERROR_SCHEMA,
  "CPZ.Exwatcher.Error": ERROR_SCHEMA,
  "CPZ.Exwatcher.Warn": ERROR_SCHEMA,
  "CPZ.Importer.Error": ERROR_SCHEMA,
  "CPZ.Importer.Warn": ERROR_SCHEMA,
  "CPZ.Marketwatcher.Error": ERROR_SCHEMA,
  "CPZ.Marketwatcher.Warn": ERROR_SCHEMA,
  "CPZ.Trader.Error": ERROR_SCHEMA,
  "CPZ.Trader.Warn": ERROR_SCHEMA,
  "CPZ.UserRobot.Error": ERROR_SCHEMA,
  "CPZ.UserRobot.Warn": ERROR_SCHEMA
};

export default ERROR_EVENTS;

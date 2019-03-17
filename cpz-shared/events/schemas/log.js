const LOG_SCHEMA = {
  serviceName: { description: "Service name", type: "string", empty: "false" }
};

const LOG_EVENTS = {
  "CPZ.Adviser.Log": LOG_SCHEMA,
  "CPZ.Backtest.Log": LOG_SCHEMA,
  "CPZ.Backtester.Log": LOG_SCHEMA,
  "CPZ.Candlebatcher.Log": LOG_SCHEMA,
  "CPZ.Control.Log": LOG_SCHEMA,
  "CPZ.Exwatcher.Log": LOG_SCHEMA,
  "CPZ.Importer.Log": LOG_SCHEMA,
  "CPZ.Marketwatcher.Log": LOG_SCHEMA,
  "CPZ.Trader.Log": LOG_SCHEMA,
  "CPZ.UserRobot.Log": LOG_SCHEMA
};

export default LOG_EVENTS;

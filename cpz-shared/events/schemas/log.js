import {
  LOG_ADVISER_LOG_EVENT,
  LOG_BACKTEST_LOG_EVENT,
  LOG_BACKTESTER_LOG_EVENT,
  LOG_CANDLEBATCHER_LOG_EVENT,
  LOG_CONTROL_LOG_EVENT,
  LOG_EXWATCHER_LOG_EVENT,
  LOG_IMPORTER_LOG_EVENT,
  LOG_MARKETWATCHER_LOG_EVENT,
  LOG_TRADER_LOG_EVENT,
  LOG_USERROBOT_LOG_EVENT
} from "../types/log";

const LOG_SCHEMA = {
  serviceName: { description: "Service name", type: "string", empty: "false" }
};
const LOG_ADVISER_LOG_EVENT_SCHEMA = {
  [LOG_ADVISER_LOG_EVENT]: LOG_SCHEMA
};
const LOG_BACKTEST_LOG_EVENT_SCHEMA = {
  [LOG_BACKTEST_LOG_EVENT]: LOG_SCHEMA
};
const LOG_BACKTESTER_LOG_EVENT_SCHEMA = {
  [LOG_BACKTESTER_LOG_EVENT]: LOG_SCHEMA
};
const LOG_CANDLEBATCHER_LOG_EVENT_SCHEMA = {
  [LOG_CANDLEBATCHER_LOG_EVENT]: LOG_SCHEMA
};
const LOG_CONTROL_LOG_EVENT_SCHEMA = {
  [LOG_CONTROL_LOG_EVENT]: LOG_SCHEMA
};
const LOG_EXWATCHER_LOG_EVENT_SCHEMA = {
  [LOG_EXWATCHER_LOG_EVENT]: LOG_SCHEMA
};
const LOG_IMPORTER_LOG_EVENT_SCHEMA = {
  [LOG_IMPORTER_LOG_EVENT]: LOG_SCHEMA
};
const LOG_MARKETWATCHER_LOG_EVENT_SCHEMA = {
  [LOG_MARKETWATCHER_LOG_EVENT]: LOG_SCHEMA
};
const LOG_TRADER_LOG_EVENT_SCHEMA = {
  [LOG_TRADER_LOG_EVENT]: LOG_SCHEMA
};
const LOG_USERROBOT_LOG_EVENT_SCHEMA = {
  [LOG_USERROBOT_LOG_EVENT]: LOG_SCHEMA
};

export {
  LOG_ADVISER_LOG_EVENT_SCHEMA,
  LOG_BACKTEST_LOG_EVENT_SCHEMA,
  LOG_BACKTESTER_LOG_EVENT_SCHEMA,
  LOG_CANDLEBATCHER_LOG_EVENT_SCHEMA,
  LOG_CONTROL_LOG_EVENT_SCHEMA,
  LOG_EXWATCHER_LOG_EVENT_SCHEMA,
  LOG_IMPORTER_LOG_EVENT_SCHEMA,
  LOG_MARKETWATCHER_LOG_EVENT_SCHEMA,
  LOG_TRADER_LOG_EVENT_SCHEMA,
  LOG_USERROBOT_LOG_EVENT_SCHEMA
};

import { BASE_ERROR } from "./base";
import {
  ERROR_ADVISER_ERROR_EVENT,
  ERROR_ADVISER_WARN_EVENT,
  ERROR_BACKTEST_ERROR_EVENT,
  ERROR_BACKTEST_WARN_EVENT,
  ERROR_BACKTESTER_ERROR_EVENT,
  ERROR_BACKTESTER_WARN_EVENT,
  ERROR_CANDLEBATCHER_ERROR_EVENT,
  ERROR_CANDLEBATCHER_WARN_EVENT,
  ERROR_CONTROL_ERROR_EVENT,
  ERROR_CONTROL_WARN_EVENT,
  ERROR_EXWATCHER_ERROR_EVENT,
  ERROR_EXWATCHER_WARN_EVENT,
  ERROR_IMPORTER_ERROR_EVENT,
  ERROR_IMPORTER_WARN_EVENT,
  ERROR_MARKETWATCHER_ERROR_EVENT,
  ERROR_MARKETWATCHER_WARN_EVENT,
  ERROR_TRADER_ERROR_EVENT,
  ERROR_TRADER_WARN_EVENT,
  ERROR_USERROBOT_ERROR_EVENT,
  ERROR_USERROBOT_WARN_EVENT
} from "../types/error";

const ERROR_SCHEMA = {
  taskId: {
    description: "Uniq task id.",
    type: "string",
    empty: false
  },
  error: BASE_ERROR
};
const ERROR_ADVISER_ERROR_EVENT_SCHEMA = {
  [ERROR_ADVISER_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_ADVISER_WARN_EVENT_SCHEMA = {
  [ERROR_ADVISER_WARN_EVENT]: ERROR_SCHEMA
};
const ERROR_BACKTEST_ERROR_EVENT_SCHEMA = {
  [ERROR_BACKTEST_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_BACKTEST_WARN_EVENT_SCHEMA = {
  [ERROR_BACKTEST_WARN_EVENT]: ERROR_SCHEMA
};
const ERROR_BACKTESTER_ERROR_EVENT_SCHEMA = {
  [ERROR_BACKTESTER_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_BACKTESTER_WARN_EVENT_SCHEMA = {
  [ERROR_BACKTESTER_WARN_EVENT]: ERROR_SCHEMA
};
const ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA = {
  [ERROR_CANDLEBATCHER_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_CANDLEBATCHER_WARN_EVENT_SCHEMA = {
  [ERROR_CANDLEBATCHER_WARN_EVENT]: ERROR_SCHEMA
};
const ERROR_CONTROL_ERROR_EVENT_SCHEMA = {
  [ERROR_CONTROL_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_CONTROL_WARN_EVENT_SCHEMA = {
  [ERROR_CONTROL_WARN_EVENT]: ERROR_SCHEMA
};
const ERROR_EXWATCHER_ERROR_EVENT_SCHEMA = {
  [ERROR_EXWATCHER_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_EXWATCHER_WARN_EVENT_SCHEMA = {
  [ERROR_EXWATCHER_WARN_EVENT]: ERROR_SCHEMA
};
const ERROR_IMPORTER_ERROR_EVENT_SCHEMA = {
  [ERROR_IMPORTER_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_IMPORTER_WARN_EVENT_SCHEMA = {
  [ERROR_IMPORTER_WARN_EVENT]: ERROR_SCHEMA
};
const ERROR_MARKETWATCHER_ERROR_EVENT_SCHEMA = {
  [ERROR_MARKETWATCHER_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_MARKETWATCHER_WARN_EVENT_SCHEMA = {
  [ERROR_MARKETWATCHER_WARN_EVENT]: ERROR_SCHEMA
};
const ERROR_TRADER_ERROR_EVENT_SCHEMA = {
  [ERROR_TRADER_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_TRADER_WARN_EVENT_SCHEMA = {
  [ERROR_TRADER_WARN_EVENT]: ERROR_SCHEMA
};
const ERROR_USERROBOT_ERROR_EVENT_SCHEMA = {
  [ERROR_USERROBOT_ERROR_EVENT]: ERROR_SCHEMA
};
const ERROR_USERROBOT_WARN_EVENT_SCHEMA = {
  [ERROR_USERROBOT_WARN_EVENT]: ERROR_SCHEMA
};

export {
  ERROR_ADVISER_ERROR_EVENT_SCHEMA,
  ERROR_ADVISER_WARN_EVENT_SCHEMA,
  ERROR_BACKTEST_ERROR_EVENT_SCHEMA,
  ERROR_BACKTEST_WARN_EVENT_SCHEMA,
  ERROR_BACKTESTER_ERROR_EVENT_SCHEMA,
  ERROR_BACKTESTER_WARN_EVENT_SCHEMA,
  ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA,
  ERROR_CANDLEBATCHER_WARN_EVENT_SCHEMA,
  ERROR_CONTROL_ERROR_EVENT_SCHEMA,
  ERROR_CONTROL_WARN_EVENT_SCHEMA,
  ERROR_EXWATCHER_ERROR_EVENT_SCHEMA,
  ERROR_EXWATCHER_WARN_EVENT_SCHEMA,
  ERROR_IMPORTER_ERROR_EVENT_SCHEMA,
  ERROR_IMPORTER_WARN_EVENT_SCHEMA,
  ERROR_MARKETWATCHER_ERROR_EVENT_SCHEMA,
  ERROR_MARKETWATCHER_WARN_EVENT_SCHEMA,
  ERROR_TRADER_ERROR_EVENT_SCHEMA,
  ERROR_TRADER_WARN_EVENT_SCHEMA,
  ERROR_USERROBOT_ERROR_EVENT_SCHEMA,
  ERROR_USERROBOT_WARN_EVENT_SCHEMA
};

import Log from "cpz/log";
import EventGrid from "cpz/events";
import { ERROR_TOPIC, LOG_TOPIC, TASKS_TOPIC } from "cpz/events/topics";
import ServiceValidator from "cpz/validator";
import {
  TASKS_BACKTESTER_START_EVENT_SCHEMA,
  TASKS_BACKTESTER_STOP_EVENT_SCHEMA,
  TASKS_BACKTESTER_STARTED_EVENT_SCHEMA,
  TASKS_BACKTESTER_STOPPED_EVENT_SCHEMA,
  TASKS_BACKTESTER_FINISHED_EVENT_SCHEMA
} from "cpz/events/schemas/tasks/backtester";
import { ERROR_BACKTESTER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_BACKTESTER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import BacktestStorageClient from "cpz/tableStorage-client/backtest";
import backtesterTables from "cpz/tableStorage-client/backtest/backtesters";
import DB from "cpz/db-client";
import BlobStorageClient from "cpz/blobStorage";
import {
  STRATEGY_CODE,
  STRATEGY_STATE,
  INDICATORS_CODE,
  INDICATORS_STATE
} from "cpz/blobStorage/containers";
import { EGConfig, ValidatorConfig } from "cpz/utils/helpers";
import { SERVICE_NAME } from "./config";

function init() {
  Log.config({
    key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    serviceName: SERVICE_NAME
  });
  ServiceValidator.add(
    ValidatorConfig([
      TASKS_BACKTESTER_START_EVENT_SCHEMA,
      TASKS_BACKTESTER_STOP_EVENT_SCHEMA,
      TASKS_BACKTESTER_STARTED_EVENT_SCHEMA,
      TASKS_BACKTESTER_STOPPED_EVENT_SCHEMA,
      TASKS_BACKTESTER_FINISHED_EVENT_SCHEMA,
      ERROR_BACKTESTER_ERROR_EVENT_SCHEMA,
      LOG_BACKTESTER_LOG_EVENT_SCHEMA
    ])
  );
  DB.init(process.env.DB_API_ENDPOINT, process.env.DB_API_ACCESS_KEY);
  EventGrid.config(EGConfig([ERROR_TOPIC, LOG_TOPIC, TASKS_TOPIC]));
  BacktestStorageClient.init(
    process.env.AZ_STORAGE_BACKTESTER_CS,
    backtesterTables
  );
  BlobStorageClient.init(
    process.env.AZ_STORAGE_BLOB_NAME,
    process.env.AZ_STORAGE_BLOB_KEY,
    [STRATEGY_CODE, STRATEGY_STATE, INDICATORS_CODE, INDICATORS_STATE]
  );
}

export default init;

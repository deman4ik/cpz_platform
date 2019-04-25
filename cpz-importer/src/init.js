import Log from "cpz/log";
import EventGrid from "cpz/events";
import { ERROR_TOPIC, LOG_TOPIC, TASKS_TOPIC } from "cpz/events/topics";
import {
  TASKS_IMPORTER_FINISHED_EVENT_SCHEMA,
  TASKS_IMPORTER_START_EVENT_SCHEMA,
  TASKS_IMPORTER_STARTED_EVENT_SCHEMA,
  TASKS_IMPORTER_STOP_EVENT_SCHEMA,
  TASKS_IMPORTER_STOPPED_EVENT_SCHEMA
} from "cpz/events/schemas/tasks/importer";
import { ERROR_IMPORTER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_IMPORTER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import DB from "cpz/db-client";
import ConnectorClient from "cpz/connector-client";
import ServiceValidator from "cpz/validator";
import { EGConfig, ValidatorConfig } from "cpz/utils/helpers";
import ControlStorageClient from "cpz/tableStorage-client/control";
import importerTables from "cpz/tableStorage-client/control/importers";
import MarketStorageClient from "cpz/tableStorage-client/market";
import candleTables from "cpz/tableStorage-client/market/candles";
import tickTables from "cpz/tableStorage-client/market/ticks";
import { SERVICE_NAME } from "./config";

function init() {
  // Setup Log
  Log.config({
    key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    serviceName: SERVICE_NAME
  });

  // Setup ServiceValidator
  ServiceValidator.add(
    ValidatorConfig([
      TASKS_IMPORTER_FINISHED_EVENT_SCHEMA,
      TASKS_IMPORTER_START_EVENT_SCHEMA,
      TASKS_IMPORTER_STARTED_EVENT_SCHEMA,
      TASKS_IMPORTER_STOP_EVENT_SCHEMA,
      TASKS_IMPORTER_STOPPED_EVENT_SCHEMA,
      ERROR_IMPORTER_ERROR_EVENT_SCHEMA,
      LOG_IMPORTER_LOG_EVENT_SCHEMA
    ])
  );
  ConnectorClient.init(
    process.env.CONNECTOR_API_ENDPOINT,
    process.env.CONNECTOR_API_KEY
  );
  DB.init(process.env.DB_API_ENDPOINT, process.env.DB_API_ACCESS_KEY);
  EventGrid.config(EGConfig([ERROR_TOPIC, LOG_TOPIC, TASKS_TOPIC]));
  ControlStorageClient.init(process.env.AZ_STORAGE_CONTROL_CS, importerTables);
  MarketStorageClient.init(process.env.AZ_STORAGE_MARKET_CS, [
    ...candleTables,
    ...tickTables
  ]);
}

export default init;

import Log from "cpz/log";
import EventGrid from "cpz/events";
import {
  ERROR_TOPIC,
  LOG_TOPIC,
  TASKS_TOPIC,
  TICKS_TOPIC
} from "cpz/events/topics";
import ServiceValidator from "cpz/validator";
import {
  TASKS_MARKETWATCHER_START_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_STARTED_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_STOP_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_STOPPED_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_UPDATED_EVENT_SCHEMA
} from "cpz/events/schemas/tasks/marketwatcher";
import { ERROR_MARKETWATCHER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_MARKETWATCHER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import { TICKS_NEWTICK_EVENT_SCHEMA } from "cpz/events/schemas/ticks";
import ControlStorageClient from "cpz/tableStorage-client/control";
import marketwatcherTables from "cpz/tableStorage-client/control/marketwatchers";
import MarketStorageClient from "cpz/tableStorage-client/market";
import tickTables from "cpz/tableStorage-client/market/ticks";
import candlesTables from "cpz/tableStorage-client/market/candles";
import ConnectorClient from "cpz/connector-client";
import { EGConfig, ValidatorConfig } from "cpz/utils/helpers";
import { SERVICE_NAME } from "./config";

function init() {
  Log.config({
    key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    serviceName: SERVICE_NAME
  });
  ServiceValidator.add(
    ValidatorConfig([
      TASKS_MARKETWATCHER_START_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_STARTED_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_STOP_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_STOPPED_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_SUBSCRIBE_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_UPDATED_EVENT_SCHEMA,
      ERROR_MARKETWATCHER_ERROR_EVENT_SCHEMA,
      LOG_MARKETWATCHER_LOG_EVENT_SCHEMA,
      TICKS_NEWTICK_EVENT_SCHEMA
    ])
  );
  EventGrid.config(
    EGConfig([ERROR_TOPIC, LOG_TOPIC, TASKS_TOPIC, TICKS_TOPIC])
  );
  ControlStorageClient.init(
    process.env.AZ_STORAGE_CONTROL_CS,
    marketwatcherTables
  );
  MarketStorageClient.init(process.env.AZ_STORAGE_MARKET_CS, [
    ...tickTables,
    ...candlesTables
  ]);
  ConnectorClient.init(
    process.env.CONNECTOR_API_ENDPOINT,
    process.env.CONNECTOR_API_KEY
  );
}

export default init;

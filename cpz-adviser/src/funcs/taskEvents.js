import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import adviserEnv from "cpz/config/environment/adviser";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import {
  TASKS_TOPIC,
  LOG_TOPIC,
  ERROR_TOPIC,
  CANDLES_TOPIC,
  SIGNALS_TOPIC
} from "cpz/events/topics";
import ServiceValidator from "cpz/validator";
import {
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  TASKS_ADVISER_RUN_EVENT,
  TASKS_ADVISER_PAUSE_EVENT,
  TASKS_ADVISER_RESUME_EVENT
} from "cpz/events/types/tasks/adviser";
import { ERROR_ADVISER_ERROR_EVENT } from "cpz/events/types/error";
import {
  TASKS_ADVISER_START_EVENT_SCHEMA,
  TASKS_ADVISER_STOP_EVENT_SCHEMA,
  TASKS_ADVISER_UPDATE_EVENT_SCHEMA,
  TASKS_ADVISER_RUN_EVENT_SCHEMA,
  TASKS_ADVISER_STARTED_EVENT_SCHEMA,
  TASKS_ADVISER_UPDATED_EVENT_SCHEMA,
  TASKS_ADVISER_STOPPED_EVENT_SCHEMA,
  TASKS_ADVISER_PAUSE_EVENT_SCHEMA,
  TASKS_ADVISER_RESUME_EVENT_SCHEMA
} from "cpz/events/schemas/tasks/adviser";
import { ERROR_ADVISER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_ADVISER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import { CANDLES_HANDLED_EVENT_SCHEMA } from "cpz/events/schemas/candles";
import { SIGNALS_NEWSIGNAL_EVENT_SCHEMA } from "cpz/events/schemas/signals";
import MarketStorageClient from "cpz/tableStorage-client/market";
import candleTables from "cpz/tableStorage-client/market/candles";
import ControlStorageClient from "cpz/tableStorage-client/control";
import adviserTables from "cpz/tableStorage-client/control/advisers";
import adviserActionTables from "cpz/tableStorage-client/control/adviserActions";
import EventsStorageClient from "cpz/tableStorage-client/events";
import eventTables from "cpz/tableStorage-client/events/events";
import BlobStorageClient from "cpz/blobStorage";
import ConnectorClient from "cpz/connector-client";
import {
  STRATEGY_CODE,
  STRATEGY_STATE,
  INDICATORS_CODE,
  INDICATORS_STATE,
  ADVISER_LOCK
} from "cpz/blobStorage/containers";
import {
  handleStart,
  handleStop,
  handleUpdate,
  handleRun,
  handlePause,
  handleResume
} from "../events/handleTasks";
import { SERVICE_NAME } from "../config";

class TaskEvents extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(adviserEnv.variables);
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: SERVICE_NAME
    });
    // Configure Validator
    const schemas = super.ValidatorConfig([
      TASKS_ADVISER_START_EVENT_SCHEMA,
      TASKS_ADVISER_STOP_EVENT_SCHEMA,
      TASKS_ADVISER_UPDATE_EVENT_SCHEMA,
      TASKS_ADVISER_RUN_EVENT_SCHEMA,
      TASKS_ADVISER_PAUSE_EVENT_SCHEMA,
      TASKS_ADVISER_RESUME_EVENT_SCHEMA,
      TASKS_ADVISER_STARTED_EVENT_SCHEMA,
      TASKS_ADVISER_UPDATED_EVENT_SCHEMA,
      TASKS_ADVISER_STOPPED_EVENT_SCHEMA,
      ERROR_ADVISER_ERROR_EVENT_SCHEMA,
      LOG_ADVISER_LOG_EVENT_SCHEMA,
      CANDLES_HANDLED_EVENT_SCHEMA,
      SIGNALS_NEWSIGNAL_EVENT_SCHEMA
    ]);
    ServiceValidator.add(schemas);
    // Configure Event Grid Client
    const EGConfig = super.EGConfig([
      TASKS_TOPIC,
      LOG_TOPIC,
      ERROR_TOPIC,
      CANDLES_TOPIC,
      SIGNALS_TOPIC
    ]);
    EventGrid.config(EGConfig);
    MarketStorageClient.init(process.env.AZ_STORAGE_MARKET_CS, candleTables);
    ControlStorageClient.init(process.env.AZ_STORAGE_CONTROL_CS, [
      ...adviserTables,
      ...adviserActionTables
    ]);
    EventsStorageClient.init(process.env.AZ_STORAGE_EVENT_CS, eventTables);
    BlobStorageClient.init(
      process.env.AZ_STORAGE_BLOB_NAME,
      process.env.AZ_STORAGE_BLOB_KEY,
      [
        STRATEGY_CODE,
        STRATEGY_STATE,
        INDICATORS_CODE,
        INDICATORS_STATE,
        ADVISER_LOCK
      ]
    );
    ConnectorClient.init(
      process.env.CONNECTOR_API_ENDPOINT,
      process.env.CONNECTOR_API_KEY
    );
  }

  /**
   * Handling Tasks Events
   *
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async run(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    if (super.checkAuth(context, req)) {
      // Handling events by target type
      const event = super.handlingEventsByTypes(context, req, [
        TASKS_ADVISER_START_EVENT,
        TASKS_ADVISER_STOP_EVENT,
        TASKS_ADVISER_UPDATE_EVENT,
        TASKS_ADVISER_RUN_EVENT,
        TASKS_ADVISER_PAUSE_EVENT,
        TASKS_ADVISER_RESUME_EVENT
      ]);

      if (event) {
        const { eventType, subject, data } = event;
        try {
          // Run handler base on eventType
          switch (eventType) {
            case TASKS_ADVISER_RUN_EVENT:
              ServiceValidator.check(TASKS_ADVISER_RUN_EVENT, data);
              await handleRun(data);
              break;
            case TASKS_ADVISER_START_EVENT:
              ServiceValidator.check(TASKS_ADVISER_START_EVENT, data);
              await handleStart(data);
              break;
            case TASKS_ADVISER_UPDATE_EVENT:
              ServiceValidator.check(TASKS_ADVISER_UPDATE_EVENT, data);
              await handleUpdate(data);
              break;
            case TASKS_ADVISER_STOP_EVENT:
              ServiceValidator.check(TASKS_ADVISER_STOP_EVENT, data);
              await handleStop(data);
              break;
            case TASKS_ADVISER_PAUSE_EVENT:
              ServiceValidator.check(TASKS_ADVISER_PAUSE_EVENT, data);
              await handlePause(data);
              break;
            case TASKS_ADVISER_RESUME_EVENT:
              ServiceValidator.check(TASKS_ADVISER_RESUME_EVENT, data);
              await handleResume(data);
              break;
            default:
              Log.warn("No tasks events");
          }
        } catch (e) {
          let error;
          if (e instanceof ServiceError) {
            error = e;
          } else {
            error = new ServiceError(
              {
                name: ServiceError.types.ADVISER_TASKS_EVENTS_ERROR,
                cause: e,
                info: { subject, eventType, ...data }
              },
              "Failed to handle Task Event"
            );
          }
          Log.error(error);
          const { taskId } = error.json.info;
          await EventGrid.publish(ERROR_ADVISER_ERROR_EVENT, {
            subject: SERVICE_NAME,
            data: { error: error.json, taskId }
          });
        }
      }
    }
    Log.clearContext();
  }
}

const func = new TaskEvents();
export default func;

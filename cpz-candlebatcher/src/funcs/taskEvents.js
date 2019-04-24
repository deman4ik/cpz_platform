import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import {
  TASKS_TOPIC,
  LOG_TOPIC,
  ERROR_TOPIC,
  CANDLES_TOPIC
} from "cpz/events/topics";
import candlebatcherEnv from "cpz/config/environment/candlebatcher";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import {
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT,
  TASKS_CANDLEBATCHER_RUN_EVENT
} from "cpz/events/types/tasks/candlebatcher";
import { ERROR_CANDLEBATCHER_ERROR_EVENT } from "cpz/events/types/error";
import {
  TASKS_CANDLEBATCHER_UPDATE_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_STOP_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_START_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_STARTED_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_STOPPED_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_UPDATED_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_RUN_EVENT_SCHEMA
} from "cpz/events/schemas/tasks/candlebatcher";
import { TASKS_IMPORTER_START_EVENT_SCHEMA } from "cpz/events/schemas/tasks/importer";
import { ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_CANDLEBATCHER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import { CANDLES_NEWCANDLE_EVENT_SCHEMA } from "cpz/events/schemas/candles";
import MarketStorageClient from "cpz/tableStorage-client/market";
import candleTables from "cpz/tableStorage-client/market/candles";
import tickTables from "cpz/tableStorage-client/market/ticks";
import ControlStorageClient from "cpz/tableStorage-client/control";
import candlebatcherTables from "cpz/tableStorage-client/control/candlebatchers";
import candlebatcherActionTables from "cpz/tableStorage-client/control/candlebatcherActions";
import EventsStorageClient from "cpz/tableStorage-client/events";
import eventTables from "cpz/tableStorage-client/events/events";
import { SERVICE_NAME } from "../config";
import {
  handleRun,
  handleStart,
  handleStop,
  handleUpdate
} from "../events/handleTasks";

class TaskEvents extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(candlebatcherEnv);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: SERVICE_NAME
    });
    // Configure Validator
    const schemas = super.ValidatorConfig([
      TASKS_CANDLEBATCHER_UPDATE_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_STOP_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_START_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_STARTED_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_STOPPED_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_UPDATED_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_RUN_EVENT_SCHEMA,
      ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA,
      LOG_CANDLEBATCHER_LOG_EVENT_SCHEMA,
      CANDLES_NEWCANDLE_EVENT_SCHEMA,
      TASKS_IMPORTER_START_EVENT_SCHEMA
    ]);
    ServiceValidator.add(schemas);
    // Configure Event Grid Client
    const EGConfig = super.EGConfig([
      TASKS_TOPIC,
      LOG_TOPIC,
      ERROR_TOPIC,
      CANDLES_TOPIC
    ]);
    EventGrid.config(EGConfig);
    MarketStorageClient.init(process.env.AZ_STORAGE_MARKET_CS, [
      ...candleTables,
      ...tickTables
    ]);
    ControlStorageClient.init(process.env.AZ_STORAGE_CONTROL_CS, [
      ...candlebatcherTables,
      ...candlebatcherActionTables
    ]);
    EventsStorageClient.init(process.env.AZ_STORAGE_EVENT_CS, eventTables);
  }

  /**
   * Handling Tasks Events
   * Operating with Trader run status.
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
        TASKS_CANDLEBATCHER_START_EVENT,
        TASKS_CANDLEBATCHER_STOP_EVENT,
        TASKS_CANDLEBATCHER_UPDATE_EVENT,
        TASKS_CANDLEBATCHER_RUN_EVENT
      ]);

      if (event) {
        const { eventType, subject, data } = event;
        try {
          // Run handler base on eventType
          switch (eventType) {
            case TASKS_CANDLEBATCHER_RUN_EVENT:
              ServiceValidator.check(TASKS_CANDLEBATCHER_RUN_EVENT, data);
              await handleRun(data);
              break;
            case TASKS_CANDLEBATCHER_START_EVENT:
              ServiceValidator.check(TASKS_CANDLEBATCHER_START_EVENT, data);
              await handleStart(data);

              break;
            case TASKS_CANDLEBATCHER_UPDATE_EVENT:
              ServiceValidator.check(TASKS_CANDLEBATCHER_UPDATE_EVENT, data);
              await handleUpdate(data);
              break;
            case TASKS_CANDLEBATCHER_STOP_EVENT:
              ServiceValidator.check(TASKS_CANDLEBATCHER_STOP_EVENT, data);
              await handleStop(data);
              break;
            default:
              Log.warn("No tasks events");
          }
          // Calling context.done for finalize function
        } catch (e) {
          let error;
          if (e instanceof ServiceError) {
            error = e;
          } else {
            error = new ServiceError(
              {
                name: ServiceError.types.CANDLEBATCHER_TASKS_EVENTS_ERROR,
                cause: e,
                info: { subject, eventType, ...data }
              },
              "Failed to handle Task Event"
            );
          }
          Log.error(error);

          await EventGrid.publish(ERROR_CANDLEBATCHER_ERROR_EVENT, {
            subject: SERVICE_NAME,
            data: { error: error.json }
          });
        }
      }
    }
    Log.clearContext();
  }
}

const func = new TaskEvents();

export default func;

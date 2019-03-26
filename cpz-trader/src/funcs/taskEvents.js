import { TASKS_TOPIC, LOG_TOPIC, ERROR_TOPIC } from "cpz/events/topics";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import {
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_UPDATE_EVENT
} from "cpz/events/types/tasks/trader";
import { ERROR_TRADER_ERROR_EVENT } from "cpz/events/types/error";
import {
  TASKS_TRADER_START_EVENT_SCHEMA,
  TASKS_TRADER_STOP_EVENT_SCHEMA,
  TASKS_TRADER_UPDATE_EVENT_SCHEMA
} from "cpz/events/schemas/tasks/trader";
import { ERROR_TRADER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_TRADER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import ControlStorageClient from "cpz/tableStorage-client/control";
import traderActionTables from "cpz/tableStorage-client/control/traderActions";
import { SERVICE_NAME } from "../config";
import { handleStart, handleStop, handleUpdate } from "../events/handleTasks";

class TaskEvents extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    try {
      // Check environment variables
      checkEnvVars(traderEnv.variables);
      // Configure Logger
      Log.config({
        key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
        serviceName: SERVICE_NAME
      });
      // Configure Validator
      const schemas = super.ValidatorConfig([
        TASKS_TRADER_START_EVENT_SCHEMA,
        TASKS_TRADER_STOP_EVENT_SCHEMA,
        TASKS_TRADER_UPDATE_EVENT_SCHEMA,
        ERROR_TRADER_ERROR_EVENT_SCHEMA,
        LOG_TRADER_LOG_EVENT_SCHEMA
      ]);
      ServiceValidator.add(schemas);
      // Configure Event Grid Client
      const EGConfig = super.EGConfig({
        TASKS_TOPIC,
        LOG_TOPIC,
        ERROR_TOPIC
      });
      EventGrid.config(EGConfig);
      // Table Storage
      ControlStorageClient.init(
        process.env.AZ_STORAGE_CONTROL_CS,
        traderActionTables
      );
    } catch (e) {
      Log.exception(e);
      throw e;
    }
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
    super.checkAuth(context, req);

    // Handling events by target type
    const event = super.handlingEventsByTypes(context, req, [
      TASKS_TRADER_START_EVENT,
      TASKS_TRADER_STOP_EVENT,
      TASKS_TRADER_UPDATE_EVENT
    ]);

    if (event) {
      const { eventType, subject, data } = event;
      try {
        // Run handler base on eventType
        switch (eventType) {
          case TASKS_TRADER_START_EVENT:
            ServiceValidator.check(TASKS_TRADER_START_EVENT, data);
            await handleStart(context, data);

            break;
          case TASKS_TRADER_UPDATE_EVENT:
            ServiceValidator.check(TASKS_TRADER_UPDATE_EVENT, data);
            await handleUpdate(context, data);
            break;
          case TASKS_TRADER_STOP_EVENT:
            ServiceValidator.check(TASKS_TRADER_STOP_EVENT, data);
            await handleStop(context, data);
            break;
          default:
            Log.warn(event, "No tasks events");
        }
      } catch (e) {
        let error;
        if (e instanceof ServiceError) {
          error = e;
        } else {
          error = new ServiceError(
            {
              name: ServiceError.types.TRADER_TASKS_EVENTS_ERROR,
              cause: e,
              info: { subject, eventType, ...data }
            },
            "Failed to handle Task Event"
          );
        }
        Log.error(error);

        await EventGrid.publish(ERROR_TRADER_ERROR_EVENT, {
          subject: SERVICE_NAME,
          data: error.json
        });
      }
    }
    Log.request(context.req, context.res);
    Log.clearContext();
    context.done();
  }
}

const func = new TaskEvents();
export default func;

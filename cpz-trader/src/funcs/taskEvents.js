import Log from "cpz/log";
import ServiceError from "cpz/error";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import {
  TASKS_TOPIC,
  LOG_TOPIC,
  ERROR_TOPIC,
  TRADES_TOPIC,
  SIGNALS_TOPIC
} from "cpz/events/topics";
import {
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TASKS_TRADER_RUN_EVENT
} from "cpz/events/types/tasks/trader";
import { ERROR_TRADER_ERROR_EVENT } from "cpz/events/types/error";
import {
  TASKS_TRADER_START_EVENT_SCHEMA,
  TASKS_TRADER_STOP_EVENT_SCHEMA,
  TASKS_TRADER_UPDATE_EVENT_SCHEMA,
  TASKS_TRADER_RUN_EVENT_SCHEMA,
  TASKS_TRADER_STARTED_EVENT_SCHEMA,
  TASKS_TRADER_STOPPED_EVENT_SCHEMA,
  TASKS_TRADER_UPDATED_EVENT_SCHEMA
} from "cpz/events/schemas/tasks/trader";
import {
  ERROR_TRADER_ERROR_EVENT_SCHEMA,
  ERROR_TRADER_WARN_EVENT_SCHEMA
} from "cpz/events/schemas/error";
import { LOG_TRADER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import { PRICES_HANDLED_EVENT_SCHEMA } from "cpz/events/schemas/prices";
import { SIGNALS_HANDLED_EVENT_SCHEMA } from "cpz/events/schemas/signals";
import {
  TRADES_ORDER_EVENT_SCHEMA,
  TRADES_POSITION_EVENT_SCHEMA
} from "cpz/events/schemas/trades";
import ConnectorClient from "cpz/connector-client";
import MarketStorageClient from "cpz/tableStorage-client/market";
import EventsStorageClient from "cpz/tableStorage-client/events";
import ControlStorageClient from "cpz/tableStorage-client/control";
import traderActionTables from "cpz/tableStorage-client/control/traderActions";
import marketTables from "cpz/tableStorage-client/market/currentPrices";
import eventTables from "cpz/tableStorage-client/events/events";
import { SERVICE_NAME } from "../config";
import {
  handleStart,
  handleStop,
  handleUpdate,
  handleRun
} from "../events/handleTasks";

class TaskEvents extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    try {
      // Check environment variables
      checkEnvVars(traderEnv);
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
        ERROR_TRADER_WARN_EVENT_SCHEMA,
        LOG_TRADER_LOG_EVENT_SCHEMA,
        PRICES_HANDLED_EVENT_SCHEMA,
        SIGNALS_HANDLED_EVENT_SCHEMA,
        TRADES_ORDER_EVENT_SCHEMA,
        TRADES_POSITION_EVENT_SCHEMA,
        TASKS_TRADER_STARTED_EVENT_SCHEMA,
        TASKS_TRADER_STOPPED_EVENT_SCHEMA,
        TASKS_TRADER_UPDATED_EVENT_SCHEMA,
        TASKS_TRADER_RUN_EVENT_SCHEMA
      ]);
      ServiceValidator.add(schemas);
      // Configure Event Grid Client
      const EGConfig = super.EGConfig({
        TASKS_TOPIC,
        TRADES_TOPIC,
        SIGNALS_TOPIC,
        LOG_TOPIC,
        ERROR_TOPIC
      });
      EventGrid.config(EGConfig);
      // Configure Connector Client
      ConnectorClient.init({
        endpoint: process.env.CONNECTOR_API_ENDPOINT,
        key: process.env.CONNECTOR_API_KEY
      });
      // Table Storage
      ControlStorageClient.init(
        process.env.AZ_STORAGE_CONTROL_CS,
        traderActionTables
      );
      MarketStorageClient.init(process.env.AZ_STORAGE_MARKET_CS, marketTables);
      EventsStorageClient.init(process.env.AZ_STORAGE_EVENT_CS, eventTables);
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
      TASKS_TRADER_UPDATE_EVENT,
      TASKS_TRADER_RUN_EVENT
    ]);

    if (event) {
      const { eventType, subject, data } = event;
      try {
        // Run handler base on eventType
        switch (eventType) {
          case TASKS_TRADER_RUN_EVENT:
            ServiceValidator.check(TASKS_TRADER_RUN_EVENT, data);
            await handleRun(data);

            break;
          case TASKS_TRADER_START_EVENT:
            ServiceValidator.check(TASKS_TRADER_START_EVENT, data);
            await handleStart(data);

            break;
          case TASKS_TRADER_UPDATE_EVENT:
            ServiceValidator.check(TASKS_TRADER_UPDATE_EVENT, data);
            await handleUpdate(data);
            break;
          case TASKS_TRADER_STOP_EVENT:
            ServiceValidator.check(TASKS_TRADER_STOP_EVENT, data);
            await handleStop(data);
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
          data: { error: error.json }
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

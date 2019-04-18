import "babel-polyfill";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import ConnectorClient from "cpz/connector-client";
import candlebatcherEnv from "cpz/config/environment/candlebatcher";
import { TASKS_TOPIC, LOG_TOPIC, ERROR_TOPIC } from "cpz/events/topics";
import Log from "cpz/log";
import { ERROR_CANDLEBATCHER_ERROR_EVENT } from "cpz/events/types/error";
import { ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_CANDLEBATCHER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import { TASKS_CANDLEBATCHER_RUN_EVENT_SCHEMA } from "cpz/events/schemas/tasks/candlebatcher";
import ControlStorageClient from "cpz/tableStorage-client/control";
import candlebatcherTables from "cpz/tableStorage-client/control/candlebatchers";
import candlebatcherActionTables from "cpz/tableStorage-client/control/candlebatcherActions";
import ServiceError from "cpz/error";
import { SERVICE_NAME } from "../config";
import handleActionTimer from "../events/handleActionTimer";

class ActionTimer extends BaseService {
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
      ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA,
      LOG_CANDLEBATCHER_LOG_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_RUN_EVENT_SCHEMA
    ]);
    ServiceValidator.add(schemas);
    // Configure Event Grid Client
    const EGConfig = super.EGConfig([TASKS_TOPIC, LOG_TOPIC, ERROR_TOPIC]);
    EventGrid.config(EGConfig);
    // Configure Connector Client
    ConnectorClient.init({
      endpoint: process.env.CONNECTOR_API_ENDPOINT,
      key: process.env.CONNECTOR_API_KEY
    });
    ControlStorageClient.init(process.env.AZ_STORAGE_CONTROL_CS, [
      ...candlebatcherTables,
      ...candlebatcherActionTables
    ]);
  }

  async run(context, timer) {
    Log.addContext(context);
    const timestamp = new Date().toISOString();
    try {
      if (timer.isPastDue) {
        Log.warn("Timer trigger is running late!");
      }
      Log.debug("Timer trigger function ran!", timestamp);
      await handleActionTimer();
    } catch (e) {
      let error;
      if (e instanceof ServiceError) {
        error = e;
      } else {
        error = new ServiceError(
          {
            name: ServiceError.types.CANDLEBATCHER_TIMER_ERROR,
            cause: e,
            info: { timestamp, timer }
          },
          "Failed to handle Timer"
        );
      }
      Log.error(error);
      await EventGrid.publish(ERROR_CANDLEBATCHER_ERROR_EVENT, {
        subject: SERVICE_NAME,
        data: { error: error.json }
      });
    }
    Log.clearContext();
  }
}

const func = new ActionTimer();

export default func;

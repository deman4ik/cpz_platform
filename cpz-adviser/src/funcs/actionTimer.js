import Log from "cpz/log";
import ServiceError from "cpz/error";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import adviserEnv from "cpz/config/environment/adviser";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import { ERROR_ADVISER_ERROR_EVENT } from "cpz/events/types/error";
import { TASKS_TOPIC, LOG_TOPIC, ERROR_TOPIC } from "cpz/events/topics";
import { ERROR_ADVISER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_ADVISER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import { TASKS_ADVISER_RUN_EVENT_SCHEMA } from "cpz/events/schemas/tasks/adviser";
import ControlStorageClient from "cpz/tableStorage-client/control";
import adviserTables from "cpz/tableStorage-client/control/advisers";
import adviserActionTables from "cpz/tableStorage-client/control/adviserActions";
import { SERVICE_NAME } from "../config";
import handleActionTimer from "../events/handleActionTimer";

class ActionTimer extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    try {
      // Check environment variables
      checkEnvVars(adviserEnv);
      // Configure Logger
      Log.config({
        key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
        serviceName: SERVICE_NAME
      });
      // Configure Validator
      const schemas = super.ValidatorConfig([
        TASKS_ADVISER_RUN_EVENT_SCHEMA,
        ERROR_ADVISER_ERROR_EVENT_SCHEMA,
        LOG_ADVISER_LOG_EVENT_SCHEMA
      ]);
      ServiceValidator.add(schemas);
      // Configure Event Grid Client
      const EGConfig = super.EGConfig([LOG_TOPIC, ERROR_TOPIC, TASKS_TOPIC]);
      EventGrid.config(EGConfig);
      // Table Storage
      ControlStorageClient.init(process.env.AZ_STORAGE_CONTROL_CS, [
        ...adviserTables,
        ...adviserActionTables
      ]);
    } catch (e) {
      Log.exception(e);
      throw e;
    }
  }

  async run(context, timer) {
    Log.addContext(context);
    const timestamp = new Date().toISOString();
    try {
      if (timer.isPastDue) {
        Log.warn("Action Timer trigger is running late!");
      }
      Log.debug("Action Timer trigger function ran!", timestamp);
      await handleActionTimer();
    } catch (e) {
      let error;
      if (e instanceof ServiceError) {
        error = e;
      } else {
        error = new ServiceError(
          {
            name: ServiceError.types.ADVISER_TIMER_ERROR,
            cause: e,
            info: { timestamp, timer }
          },
          "Failed to handle Timer"
        );
      }
      Log.error(error);
      await EventGrid.publish(ERROR_ADVISER_ERROR_EVENT, {
        subject: SERVICE_NAME,
        data: { error: error.json }
      });
    }
    Log.clearContext();
  }
}

const func = new ActionTimer();
export default func;

import Log from "cpz/log";
import ServiceError from "cpz/error";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import { ERROR_TRADER_ERROR_EVENT } from "cpz/events/types/error";
import { LOG_TOPIC, ERROR_TOPIC } from "cpz/events/topics";
import { ERROR_TRADER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_TRADER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import ControlStorageClient from "cpz/tableStorage-client/control";
import traderTables from "cpz/tableStorage-client/control/traders";
import traderActionTables from "cpz/tableStorage-client/control/traderActions";
import { SERVICE_NAME } from "../config";
import handleIdleTimer from "../events/handleIdleTimer";

class Timer extends BaseService {
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
        ERROR_TRADER_ERROR_EVENT_SCHEMA,
        LOG_TRADER_LOG_EVENT_SCHEMA
      ]);
      ServiceValidator.add(schemas);
      // Configure Event Grid Client
      const EGConfig = super.EGConfig({
        LOG_TOPIC,
        ERROR_TOPIC
      });
      EventGrid.config(EGConfig);
      // Table Storage
      ControlStorageClient.init(process.env.AZ_STORAGE_CONTROL_CS, [
        ...traderTables,
        ...traderActionTables
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
        Log.warn("Idle Timer trigger is running late!");
      }
      Log.debug("Idle Timer trigger function ran!", timestamp);
      await handleIdleTimer();
    } catch (e) {
      let error;
      if (e instanceof ServiceError) {
        error = e;
      } else {
        error = new ServiceError(
          {
            name: ServiceError.types.TRADER_TIMER_ERROR,
            cause: e,
            info: { timestamp, timer }
          },
          "Failed to handle Timer"
        );
      }
      Log.error(error);
      await EventGrid.publish(ERROR_TRADER_ERROR_EVENT, {
        subject: SERVICE_NAME,
        data: { error: error.json }
      });
    }
    Log.clearContext();
    context.done();
  }
}

const func = new Timer();
export default func;

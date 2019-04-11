import Log from "cpz/log";
import ServiceError from "cpz/error";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import { SIGNALS_NEWSIGNAL_EVENT } from "cpz/events/types/signals";
import { ERROR_TRADER_ERROR_EVENT } from "cpz/events/types/error";
import {
  SIGNALS_NEWSIGNAL_EVENT_SCHEMA,
  SIGNALS_HANDLED_EVENT_SCHEMA
} from "cpz/events/schemas/signals";
import { ERROR_TRADER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import ControlStorageClient from "cpz/tableStorage-client/control";
import traderTables from "cpz/tableStorage-client/control/traders";
import traderActionTables from "cpz/tableStorage-client/control/traderActions";
import { SERVICE_NAME } from "../config";
import handleSignalEvent from "../events/handleSignals";

class SignalEvents extends BaseService {
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
        SIGNALS_NEWSIGNAL_EVENT_SCHEMA,
        SIGNALS_HANDLED_EVENT_SCHEMA,
        ERROR_TRADER_ERROR_EVENT_SCHEMA
      ]);
      ServiceValidator.add(schemas);
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

  /**
   * Handling Signal Events
   * Operating with signal data.
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async run(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    super.checkAuth(context, req);
    // Handling event by target type

    const event = super.handlingEventsByTypes(context, req, [
      SIGNALS_NEWSIGNAL_EVENT
    ]);
    if (event) {
      const { eventType, subject, data } = event;
      try {
        // Validate event by target schema
        ServiceValidator.check(SIGNALS_NEWSIGNAL_EVENT, data);
        // Handling signal
        await handleSignalEvent(data);
        // Calling context.done for finalize function
      } catch (e) {
        let error;
        if (e instanceof ServiceError) {
          error = e;
        } else {
          error = new ServiceError(
            {
              name: ServiceError.types.TRADER_SIGNALS_EVENTS_ERROR,
              cause: e,
              info: { subject, eventType, ...data }
            },
            "Failed to handle Signal Event"
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

const func = new SignalEvents();
export default func;

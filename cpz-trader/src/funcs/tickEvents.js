import Log from "cpz/log";
import ServiceError from "cpz/error";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import { TICKS_NEWTICK_EVENT } from "cpz/events/types/ticks";
import { ERROR_TRADER_ERROR_EVENT } from "cpz/events/types/error";
import { LOG_TOPIC, ERROR_TOPIC } from "cpz/events/topics";
import { TICKS_NEWTICK_EVENT_SCHEMA } from "cpz/events/schemas/ticks";
import { ERROR_TRADER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_TRADER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import ControlStorageClient from "cpz/tableStorage-client/control";
import traderTables from "cpz/tableStorage-client/control/traders";
import traderActionTables from "cpz/tableStorage-client/control/traderActions";
import { SERVICE_NAME } from "../config";
import { handleTick } from "../events/handlePrices";

class TickEvents extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(traderEnv);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: SERVICE_NAME
    });
    // Configure Validator
    const schemas = super.ValidatorConfig([
      TICKS_NEWTICK_EVENT_SCHEMA,
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
  }

  /**
   * Handling Tick Events
   * Operating with Tick data.
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async run(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    await super.checkAuth(context, req);

    // Handling events by target type
    const event = await super.handlingEventsByTypes(context, req, [
      TICKS_NEWTICK_EVENT
    ]);

    if (event) {
      const { eventType, subject, data } = event;
      // Validate event by target schema
      try {
        ServiceValidator.check(TICKS_NEWTICK_EVENT, data);
        // Handling ticks
        await handleTick(data);
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
            "Failed to handle Tick Event"
          );
        }
        Log.error(error);

        await EventGrid.publish(ERROR_TRADER_ERROR_EVENT, {
          subject: SERVICE_NAME,
          data: { error: error.json }
        });
      }
    }
    // Calling context.done for finalize function
    Log.request(context.req, context.res);
    Log.clearContext();
  }
}

const func = new TickEvents();
export default func;

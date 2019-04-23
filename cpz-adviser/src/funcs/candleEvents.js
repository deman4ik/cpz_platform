import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import adviserEnv from "cpz/config/environment/adviser";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import { LOG_TOPIC, ERROR_TOPIC } from "cpz/events/topics";
import ServiceValidator from "cpz/validator";
import { CANDLES_NEWCANDLE_EVENT } from "cpz/events/types/candles";
import { ERROR_ADVISER_ERROR_EVENT } from "cpz/events/types/error";
import { CANDLES_NEWCANDLE_EVENT_SCHEMA } from "cpz/events/schemas/candles";
import { ERROR_ADVISER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_ADVISER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import ControlStorageClient from "cpz/tableStorage-client/control";
import adviserTables from "cpz/tableStorage-client/control/advisers";
import adviserActionTables from "cpz/tableStorage-client/control/adviserActions";
import handleCandle from "../events/handleCandles";
import { SERVICE_NAME } from "../config";

class CandleEvents extends BaseService {
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
      CANDLES_NEWCANDLE_EVENT_SCHEMA,
      ERROR_ADVISER_ERROR_EVENT_SCHEMA,
      LOG_ADVISER_LOG_EVENT_SCHEMA
    ]);
    ServiceValidator.add(schemas);
    // Configure Event Grid Client
    const EGConfig = super.EGConfig([LOG_TOPIC, ERROR_TOPIC]);
    EventGrid.config(EGConfig);
    ControlStorageClient.init(process.env.AZ_STORAGE_CONTROL_CS, [
      ...adviserTables,
      ...adviserActionTables
    ]);
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
        CANDLES_NEWCANDLE_EVENT
      ]);

      if (event) {
        const { eventType, subject, data } = event;
        try {
          ServiceValidator.check(CANDLES_NEWCANDLE_EVENT, data);
          await handleCandle(data);
        } catch (e) {
          let error;
          if (e instanceof ServiceError) {
            error = e;
          } else {
            error = new ServiceError(
              {
                name: ServiceError.types.ADVISER_CANDLES_EVENTS_ERROR,
                cause: e,
                info: { subject, eventType, ...data }
              },
              "Failed to handle Task Event"
            );
          }
          Log.error(error);

          await EventGrid.publish(ERROR_ADVISER_ERROR_EVENT, {
            subject: SERVICE_NAME,
            data: { error: error.json }
          });
        }
      }
    }
    Log.request(context.req, context.res);
    Log.clearContext();
  }
}

const func = new CandleEvents();
export default func;

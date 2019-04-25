import Log from "cpz/log";
import ServiceError from "cpz/error";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import { CANDLES_NEWCANDLE_EVENT } from "cpz/events/types/candles";
import { ERROR_TRADER_ERROR_EVENT } from "cpz/events/types/error";
import { LOG_TOPIC, ERROR_TOPIC } from "cpz/events/topics";
import { CANDLES_NEWCANDLE_EVENT_SCHEMA } from "cpz/events/schemas/candles";
import { ERROR_TRADER_ERROR_EVENT_SCHEMA } from "cpz/events/schemas/error";
import { LOG_TRADER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import ControlStorageClient from "cpz/tableStorage-client/control";
import traderTables from "cpz/tableStorage-client/control/traders";
import traderActionTables from "cpz/tableStorage-client/control/traderActions";
import { SERVICE_NAME } from "../config";
import { handleCandle } from "../events/handlePrices";

class CandleEvents extends BaseService {
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
        CANDLES_NEWCANDLE_EVENT_SCHEMA,
        ERROR_TRADER_ERROR_EVENT_SCHEMA,
        LOG_TRADER_LOG_EVENT_SCHEMA
      ]);
      ServiceValidator.add(schemas);
      // Configure Event Grid Client
      const EGConfig = super.EGConfig([LOG_TOPIC, ERROR_TOPIC]);
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

  /**
   * Handling Candle Events
   * Operating with candle data. Saving her in storage and running Traders
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async run(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    if (super.checkAuth(context, req)) {
      // Handling event by target type
      const event = super.handlingEventsByTypes(context, req, [
        CANDLES_NEWCANDLE_EVENT
      ]);
      if (event) {
        const { eventType, subject, data } = event;
        try {
          // Validate event by target schema
          ServiceValidator.check(CANDLES_NEWCANDLE_EVENT, data);
          // Handling candle
          await handleCandle(data);
        } catch (e) {
          let error;
          if (e instanceof ServiceError) {
            error = e;
          } else {
            error = new ServiceError(
              {
                name: ServiceError.types.TRADER_CANDLES_EVENTS_ERROR,
                cause: e,
                info: { subject, eventType, ...data }
              },
              "Failed to handle Candle Event"
            );
          }
          Log.error(error);

          await EventGrid.publish(ERROR_TRADER_ERROR_EVENT, {
            subject: SERVICE_NAME,
            data: error.json
          });
        }
      }
    }
    Log.clearContext();
  }
}

const func = new CandleEvents();
export default func;

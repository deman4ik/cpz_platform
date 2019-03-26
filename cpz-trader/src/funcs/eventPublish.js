import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import EventGrid from "cpz/events";
import BaseService from "cpz/services/baseService";
import ServiceValidator from "cpz/validator";
import {
  TASKS_TOPIC,
  SIGNALS_TOPIC,
  TRADES_TOPIC,
  LOG_TOPIC,
  ERROR_TOPIC
} from "cpz/events/topics";
import { PRICES_HANDLED_EVENT_SCHEMA } from "cpz/events/schemas/prices";
import { SIGNALS_HANDLED_EVENT_SCHEMA } from "cpz/events/schemas/signals";
import {
  TRADES_ORDER_EVENT_SCHEMA,
  TRADES_POSITION_EVENT_SCHEMA
} from "cpz/events/schemas/trades";
import {
  TASKS_TRADER_STARTED_EVENT_SCHEMA,
  TASKS_TRADER_STOPPED_EVENT_SCHEMA,
  TASKS_TRADER_UPDATED_EVENT_SCHEMA
} from "cpz/events/schemas/tasks/trader";
import { LOG_TRADER_LOG_EVENT_SCHEMA } from "cpz/events/schemas/log";
import {
  ERROR_TRADER_ERROR_EVENT_SCHEMA,
  ERROR_TRADER_WARN_EVENT_SCHEMA
} from "cpz/events/schemas/error";
import { SERVICE_NAME } from "../config";
import { traderStateToCommonProps } from "../utils/helpers";

class EventPublish extends BaseService {
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
        PRICES_HANDLED_EVENT_SCHEMA,
        SIGNALS_HANDLED_EVENT_SCHEMA,
        TRADES_ORDER_EVENT_SCHEMA,
        TRADES_POSITION_EVENT_SCHEMA,
        TASKS_TRADER_STARTED_EVENT_SCHEMA,
        TASKS_TRADER_STOPPED_EVENT_SCHEMA,
        TASKS_TRADER_UPDATED_EVENT_SCHEMA,
        LOG_TRADER_LOG_EVENT_SCHEMA,
        ERROR_TRADER_ERROR_EVENT_SCHEMA,
        ERROR_TRADER_WARN_EVENT_SCHEMA
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
    } catch (e) {
      Log.exception(e);
      throw e;
    }
  }

  async run(context, { state, data }) {
    try {
      Log.addContext(context, traderStateToCommonProps(state));
      Log.debug("eventPublish", state, data);
      const { eventType, eventData } = data;
      await EventGrid.publish(eventType, eventData);
      Log.clearContext();
      return true;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.TRADER_EVENTS_PUBLISH_ERROR,
          cause: e,
          info: {
            ...traderStateToCommonProps(state),
            ...data
          }
        },
        "Failed to publish event"
      );
      // TODO: Save event to storage
      Log.exception(error);
      Log.clearContext();
      throw error;
    }
  }
}

const func = new EventPublish();
export default func;

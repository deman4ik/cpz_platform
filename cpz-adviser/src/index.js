import Log from "cpz/log";
import { checkEnvVars } from "cpz/utils/environment";
import adviserEnv from "cpz/config/environment/adviser";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import ServiceValidator from "cpz/validator";
import {
  handleStart,
  handleStop,
  handleUpdate
} from "./adviser/handleTaskEvents";
import handleCandle from "./adviser/handleCandleEvents";
import config from "./config";

class AdviserService extends BaseService {
  constructor() {
    super();
    this.config = config;
    console.log("constructor start");
    this.init();
    console.log("constructor end");
    // this.db = new DB();
  }

  init() {
    console.log("init start");
    // Check environment variables
    checkEnvVars(adviserEnv.variables);
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: this.config.serviceName
    });
    // Configure Validator
    ServiceValidator.add(this.config.events.schemas);
    // Configure Event Grid Client
    const EGConfig = super.EGConfig(this.config.events.topics);
    EventGrid.config(EGConfig);
    console.log("init end");
  }

  /**
   * Handling Signal Events
   * Operating with signal data.
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async candleEvents(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    super.checkAuth(context, req);

    const { CANDLES_NEWCANDLE_EVENT } = this.config.events.types;

    // Handling event by target type
    const event = super.handlingEventsByTypes(context, req, [
      CANDLES_NEWCANDLE_EVENT
    ]);

    if (event) {
      const { subject, data } = event;
      try {
        // Validate event by target schema
        ServiceValidator.check(CANDLES_NEWCANDLE_EVENT, data);
        // Handling candle
        await handleCandle(context, { subject, ...data });
      } catch (error) {
        Log.error(error);
        await EventGrid.publish("CPZ.Adviser.Error", data);
      }
    }
    // Calling context.done for finalize function
    Log.request(context.req, context.res);
    Log.clearContext();
  }

  /**
   * Handling Tasks Events
   * Operating with Trader run status.
   *
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async taskEvents(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    await super.checkAuth(context, req);
    // Handling events by target type
    const {
      TASKS_ADVISER_START_EVENT,
      TASKS_ADVISER_STOP_EVENT,
      TASKS_ADVISER_UPDATE_EVENT
    } = this.config.events.types;
    const event = await super.handlingEventsByTypes(context, req, [
      TASKS_ADVISER_START_EVENT,
      TASKS_ADVISER_STOP_EVENT,
      TASKS_ADVISER_UPDATE_EVENT
    ]);

    if (event) {
      // TODO Combine Task Event in one Event with prop actions: "start/stop/update"
      const { eventType, subject, data } = event;
      // Run handler base on eventType
      try {
        switch (eventType) {
          // Validate event by target schema
          case TASKS_ADVISER_START_EVENT:
            ServiceValidator.check(TASKS_ADVISER_START_EVENT, data);
            await handleStart(context, {
              subject,
              ...data
            });

            break;
          case TASKS_ADVISER_UPDATE_EVENT:
            // Validate event by target schema
            ServiceValidator.check(TASKS_ADVISER_UPDATE_EVENT, data);
            await handleUpdate(context, {
              subject,
              ...data
            });
            break;
          case TASKS_ADVISER_STOP_EVENT:
            // Validate event by target schema
            ServiceValidator.check(TASKS_ADVISER_STOP_EVENT, data);
            await handleStop(context, { subject, ...data });
            break;
          default:
            Log.warn("No tasks events");
        }
      } catch (error) {
        Log.error(error);
        await EventGrid.publish("CPZ.Adviser.Error", data);
      }
    }
    Log.request(context.req, context.res);
    Log.clearContext();
    // Calling context.done for finalize function
  }
}

const service = new AdviserService();
export default service;

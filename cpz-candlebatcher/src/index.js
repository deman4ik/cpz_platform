import "babel-polyfill";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import ConnectorClient from "cpz/connector-client";
import candlebatcherEnv from "cpz/config/environment/candlebatcher";
import Log from "cpz/log";
import {
  handleStart,
  handleStop,
  handleUpdate
} from "./batcher/handleTaskEvents";
import config from "./config";
import handleCandlesTimer from "./batcher/handleTimer";

class CandlebatcherService extends BaseService {
  constructor() {
    super();
    this.config = config;
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(candlebatcherEnv.variables);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: this.config.serviceName
    });
    // Configure Validator
    ServiceValidator.add(this.config.events.schemas);
    // Configure Event Grid Client
    const EGConfig = super.EGConfig(this.config.events.topics);
    EventGrid.config(EGConfig);
    // Configure Connector Client
    this.connector = new ConnectorClient({
      endpoint: process.env.CONNECTOR_API_ENDPOINT,
      key: process.env.CONNECTOR_API_KEY
    });
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
    super.checkAuth(context, req);
    const {
      BASE_EVENT,
      TASKS_CANDLEBATCHER_START_EVENT,
      TASKS_CANDLEBATCHER_STOP_EVENT,
      TASKS_CANDLEBATCHER_UPDATE_EVENT
    } = this.config.events.types;
    // Handling events by target type
    const event = super.handlingEventsByTypes(context, req, [
      TASKS_CANDLEBATCHER_START_EVENT,
      TASKS_CANDLEBATCHER_STOP_EVENT,
      TASKS_CANDLEBATCHER_UPDATE_EVENT
    ]);

    if (event) {
      const { eventType, subject, data } = event;
      try {
        // Validate events by target schema
        ServiceValidator.check(BASE_EVENT, data);
        // Run handler base on eventType
        switch (eventType) {
          case TASKS_CANDLEBATCHER_START_EVENT:
            ServiceValidator.check(TASKS_CANDLEBATCHER_START_EVENT, data);
            await handleStart(context, {
              subject,
              ...data
            });

            break;
          case TASKS_CANDLEBATCHER_UPDATE_EVENT:
            ServiceValidator.check(TASKS_CANDLEBATCHER_UPDATE_EVENT, data);
            await handleUpdate(context, {
              subject,
              ...data
            });
            break;
          case TASKS_CANDLEBATCHER_STOP_EVENT.eventType:
            ServiceValidator.check(TASKS_CANDLEBATCHER_STOP_EVENT, data);
            await handleStop(context, { subject, ...data });
            break;
          default:
            Log.warn("No tasks events");
        }
        // Calling context.done for finalize function
        context.done();
      } catch (error) {
        Log.error(error);
        await EventGrid.publish("CPZ.Candlebatcher.Error", error.json);
      }
    }
    Log.request(context.req, context.res);
    Log.clearContext();
    context.done();
  }

  async timerTrigger(context, timer) {
    Log.addContext(context);
    const timeStamp = new Date().toISOString();

    if (timer.isPastDue) {
      Log.warn("Timer trigger is running late!");
    }
    Log.debug("Timer trigger function ran!", timeStamp);
    await handleCandlesTimer(context);
    Log.clearContext();
  }
}

const service = new CandlebatcherService();

export default service;

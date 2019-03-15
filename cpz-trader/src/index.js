import "babel-polyfill";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import EventGrid from "cpz/events";
import ConnectorClient from "cpz/connector-client";
import handleSignal from "./trader/handleSignalEvents";
import { handleCandle, handleTick } from "./trader/handlePriceEvents";
import positionsTimer from "./trader/positionsTimer";
import tradersTimer from "./trader/tradersTimer";
import {
  handleStart,
  handleStop,
  handleUpdate
} from "./trader/handleTaskEvents";
import config from "./config";

class TraderService extends BaseService {
  constructor() {
    super();
    this.config = config;
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(traderEnv.variables);
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
   * Handling Candle Events
   * Operating with candle data. Saving her in storage and running Traders
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
        // TODO: error instanceOf ServiceError
        // const { ERROR_TOPIC } = this.config.events.topics;
        await EventGrid.publish("CPZ.Trader.Error", error.json);
      }
    }
    // Calling context.done for finalize function
    Log.request(context.req, context.res);
    Log.clearContext();
    context.done();
  }

  /**
   * Handling Signal Events
   * Operating with signal data.
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async signalEvents(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    super.checkAuth(context, req);
    // Handling event by target type
    const { SIGNALS_NEWSIGNAL_EVENT } = this.config.events.types;
    const event = super.handlingEventsByTypes(context, req, [
      SIGNALS_NEWSIGNAL_EVENT
    ]);
    if (event) {
      const { subject, data } = event;
      try {
        // Validate event by target schema
        ServiceValidator.check(SIGNALS_NEWSIGNAL_EVENT, data);
        // Handling signal
        await handleSignal(context, { subject, ...data });
        // Calling context.done for finalize function
      } catch (error) {
        Log.error(error);
        await EventGrid.publish("CPZ.Trader.Error", error.json);
      }
    }
    Log.request(context.req, context.res);
    Log.clearContext();
    context.done();
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
      TASKS_TRADER_START_EVENT,
      TASKS_TRADER_STOP_EVENT,
      TASKS_TRADER_UPDATE_EVENT
    } = this.config.events.types;
    // Handling events by target type
    const event = super.handlingEventsByTypes(context, req, [
      TASKS_TRADER_START_EVENT,
      TASKS_TRADER_STOP_EVENT,
      TASKS_TRADER_UPDATE_EVENT
    ]);

    if (event) {
      // TODO Combine Task Event in one Event with prop actions: "start/stop/update"
      const { eventType, subject, data } = event;
      try {
        // Validate events by target schema
        ServiceValidator.check(BASE_EVENT, data);
        // Run handler base on eventType
        switch (eventType) {
          case TASKS_TRADER_START_EVENT.eventType:
            ServiceValidator.check(TASKS_TRADER_START_EVENT, data);
            await handleStart(context, {
              subject,
              ...data
            });

            break;
          case TASKS_TRADER_UPDATE_EVENT.eventType:
            ServiceValidator.check(TASKS_TRADER_UPDATE_EVENT, data);
            await handleUpdate(context, {
              subject,
              ...data
            });
            break;
          case TASKS_TRADER_STOP_EVENT.eventType:
            ServiceValidator.check(TASKS_TRADER_STOP_EVENT, data);
            await handleStop(context, { subject, ...data });
            break;
          default:
            Log.warn("No tasks events");
        }
        // Calling context.done for finalize function
        context.done();
      } catch (error) {
        Log.error(error);
        await EventGrid.publish("CPZ.Trader.Error", error.json);
      }
    }
    Log.request(context.req, context.res);
    Log.clearContext();
    context.done();
  }

  /**
   * Handling Tick Events
   * Operating with Tick data.
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async tickEvents(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    await super.checkAuth(context, req);
    const { TICKS_NEWTICK_EVENT } = this.config.events.types;
    // Handling events by target type
    const event = await super.handlingEventsByTypes(context, req, [
      TICKS_NEWTICK_EVENT
    ]);

    if (event) {
      const { subject, data } = event;
      // Validate event by target schema
      try {
        ServiceValidator.check(TICKS_NEWTICK_EVENT, data);
        // Handling ticks
        await handleTick(context, { subject, ...data });
      } catch (error) {
        Log.error(error);
        await EventGrid.publish("CPZ.Trader.Error", error.json);
      }
    }
    // Calling context.done for finalize function
    Log.request(context.req, context.res);
    Log.clearContext();
    context.done();
  }

  async timerEvent(context, timer) {
    Log.addContext(context);
    const timeStamp = new Date().toISOString();
    try {
      if (timer.isPastDue) {
        Log.warn("Timer trigger is running late!");
      }
      Log.debug("Timer trigger function ran!", timeStamp);
      await positionsTimer(context);
      await tradersTimer(context);
      context.done();
    } catch (error) {
      Log.error(error);
      ServiceError(error.json);
      context.done();
    }
    Log.clearContext();
  }
}

const service = new TraderService();

export default service;

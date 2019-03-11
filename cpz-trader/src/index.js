import "babel-polyfill";
import { TRADER_SERVICE } from "cpzServices";
import Log from "cpzLog";
import { checkEnvVars } from "cpzUtils/environment";
import traderEnv from "cpzEnv/trader";
import {
  BASE_EVENT,
  CANDLES_NEWCANDLE_EVENT,
  SIGNALS_NEWSIGNAL_EVENT,
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TICKS_NEWTICK_EVENT
} from "cpzConfig/events/types";
import BaseService from "../../cpz-shared/services/baseService";
import handleSignal from "./trader/handleSignalEvents";
import { handleCandle, handleTick } from "./trader/handlePriceEvents";
import positionsTimer from "./trader/positionsTimer";
import tradersTimer from "./trader/tradersTimer";
import {
  handleStart,
  handleStop,
  handleUpdate
} from "./trader/handleTaskEvents";

class TraderService extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    checkEnvVars(traderEnv.variables);
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: TRADER_SERVICE
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
    try {
      Log.addContext(context);
      // Checking that request is authorized
      await super.checkAuth(context, req);
      // Handling event by target type
      const event = await super.handlingEventsByTypes(context, req, [
        CANDLES_NEWCANDLE_EVENT.eventType
      ]);
      if (event) {
        const { subject, data } = event;
        // Validate event by target schema
        await super.validateEvents(event, CANDLES_NEWCANDLE_EVENT.dataSchema);
        // Handling candle
        await handleCandle(context, { subject, ...data });
        // Calling context.done for finalize function
        Log.request(context.req, context.res);
        context.done();
      }
    } catch (error) {
      Log.error(error);
      context.done();
    }
  }

  /**
   * Handling Signal Events
   * Operating with signal data.
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async signalEvents(context, req) {
    try {
      Log.addContext(context);
      // Checking that request is authorized
      await super.checkAuth(context, req);
      // Handling event by target type
      const event = await super.handlingEventsByTypes(context, req, [
        SIGNALS_NEWSIGNAL_EVENT.eventType
      ]);
      // Validate event by target schema
      if (event) {
        const { subject, data } = event;
        await super.validateEvents(data, SIGNALS_NEWSIGNAL_EVENT.dataSchema);
        // Handling signal
        await handleSignal(context, { subject, ...data });
        // Calling context.done for finalize function
        Log.request(context.req, context.res);
        context.done();
      }
    } catch (error) {
      Log.error(error);
      context.done();
    }
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
    try {
      Log.addContext(context);
      // Checking that request is authorized
      await super.checkAuth(context, req);
      // Handling events by target type
      const event = await super.handlingEventsByTypes(context, req, [
        TASKS_TRADER_START_EVENT.eventType,
        TASKS_TRADER_STOP_EVENT.eventType,
        TASKS_TRADER_UPDATE_EVENT.eventType
      ]);

      if (event) {
        // TODO Combine Task Event in one Event with prop actions: "start/stop/update"
        const { eventType, subject, data } = event;
        // Validate events by target schema
        await super.validateEvents(event, BASE_EVENT.dataSchema);
        // Run handler base on eventType
        switch (eventType) {
          case TASKS_TRADER_START_EVENT.eventType:
            await super.validateEvents(
              data,
              TASKS_TRADER_START_EVENT.dataSchema
            );
            await handleStart(context, {
              subject,
              ...data
            });

            break;
          case TASKS_TRADER_UPDATE_EVENT.eventType:
            await super.validateEvents(
              data,
              TASKS_TRADER_UPDATE_EVENT.dataSchema
            );
            await handleUpdate(context, {
              subject,
              ...data
            });
            break;
          case TASKS_TRADER_STOP_EVENT.eventType:
            await super.validateEvents(
              data,
              TASKS_TRADER_STOP_EVENT.dataSchema
            );
            await handleStop(context, { subject, ...data });
            break;
          default:
            Log.warn("No tasks events");
        }
        Log.request(context.req, context.res);
        // Calling context.done for finalize function
        context.done();
      }
    } catch (error) {
      Log.error(error);
      context.done();
    }
  }

  /**
   * Handling Tick Events
   * Operating with Tick data.
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  async tickEvents(context, req) {
    try {
      Log.addContext(context);
      // Checking that request is authorized
      await super.checkAuth(context, req);
      // Handling events by target type
      const event = await super.handlingEventsByTypes(context, req, [
        TICKS_NEWTICK_EVENT.eventType
      ]);

      if (event) {
        const { subject, data } = event;
        // Validate event by target schema
        await super.validateEvents(data, TICKS_NEWTICK_EVENT.dataSchema);
        // Handling ticks
        await handleTick(context, { subject, ...data });
        // Calling context.done for finalize function
        Log.request(context.req, context.res);
        context.done();
      }
    } catch (error) {
      Log.error(error);
      context.done();
    }
  }

  async timerEvent(context, timer) {
    try {
      Log.addContext(context);
      const timeStamp = new Date().toISOString();

      if (timer.isPastDue) {
        Log.warn("Timer trigger is running late!");
      }
      Log.debug("Timer trigger function ran!", timeStamp);
      await positionsTimer(context);
      await tradersTimer(context);
      context.done();
    } catch (error) {
      Log.error(error);
      context.done();
    }
    // TODO: Log.clearContext();
  }
}

const service = new TraderService();

export default service;

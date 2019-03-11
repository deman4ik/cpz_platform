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
    console.log("constructor start");
    this.init();
    console.log("constructor end");
  }

  init() {
    console.log("init start");
    checkEnvVars(traderEnv.variables);
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: TRADER_SERVICE
    });
    console.log("init end");
  }

  /**
   * Handling Candle Events
   * Operating with candle data. Saving her in storage and running Traders
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  candleEvents(context, req) {
    Log.addContext(context);
    super
      // Checking that request is authorized
      .checkAuth(context, req)
      // Handling event by target type
      .then(request =>
        super.handlingEventsByTypes(context, request, [
          CANDLES_NEWCANDLE_EVENT.eventType
        ])
      )
      // Validate event by target schema
      .then(event =>
        super.validateEvents(event, CANDLES_NEWCANDLE_EVENT.dataSchema)
      )
      // Handling candle
      .then(candleEvent => handleCandle(context, candleEvent))
      // Calling context.done for finalize function
      .then(() => {
        Log.request(context.req, context.res);
        context.done();
      })
      .catch(error => {
        Log.error(error);
        context.done();
      });
  }

  /**
   * Handling Signal Events
   * Operating with signal data.
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  signalEvents(context, req) {
    Log.addContext(context);
    super
      // Checking that request is authorized
      .checkAuth(context, req)
      // Handling event by target type
      .then(request =>
        super.handlingEventsByTypes(context, request, [
          SIGNALS_NEWSIGNAL_EVENT.eventType
        ])
      )
      // Validate event by target schema
      .then(event =>
        super.validateEvents(event, SIGNALS_NEWSIGNAL_EVENT.dataSchema)
      )
      // Handling signal
      .then(signalEvent => handleSignal(context, signalEvent))
      // Calling context.done for finalize function
      .then(() => {
        Log.request(context.req, context.res);
        context.done();
      })
      .catch(error => {
        Log.error(error);
        context.done();
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
  tasksEvent(context, req) {
    Log.addContext(context);
    super
      // Checking that request is authorized
      .checkAuth(context, req)
      // Handling events by target type
      .then(request =>
        super.handlingEventsByTypes(context, request, [
          TASKS_TRADER_START_EVENT.eventType,
          TASKS_TRADER_STOP_EVENT.eventType,
          TASKS_TRADER_UPDATE_EVENT.eventType
        ])
      )
      // TODO Combine Task Event in one Event with prop actions: "start/stop/update"
      .then(inValidateEvent => {
        const { eventType } = inValidateEvent;
        super
          // Validate events by target schema
          .validateEvents(inValidateEvent, BASE_EVENT.dataSchema)
          .then(async event => {
            // Run handler base on eventType
            switch (eventType) {
              case TASKS_TRADER_START_EVENT.eventType:
                super
                  .validateEvents(
                    event.data,
                    TASKS_TRADER_START_EVENT.dataSchema
                  )
                  .then(startEvent => handleStart(context, startEvent));
                break;
              case TASKS_TRADER_UPDATE_EVENT.eventType:
                super
                  .validateEvents(
                    event.data,
                    TASKS_TRADER_UPDATE_EVENT.dataSchema
                  )
                  .then(updateEvent => handleUpdate(context, updateEvent));
                break;
              case TASKS_TRADER_STOP_EVENT.eventType:
                super
                  .validateEvents(
                    event.data,
                    TASKS_TRADER_STOP_EVENT.dataSchema
                  )
                  .then(stopEvent => handleStop(context, stopEvent));
                break;
              default:
                Log.info("No tasks events");
            }
          });
      })
      // Calling context.done for finalize function
      .then(() => {
        Log.request(context.req, context.res);
        context.done();
      })
      .catch(error => {
        Log.error(error);
        context.done();
      });
  }

  /**
   * Handling Tick Events
   * Operating with Tick data.
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - HTTP trigger with Event Data
   */
  tickEvent(context, req) {
    Log.addContext(context);
    super
      // Checking that request is authorized
      .checkAuth(context, req)
      // Handling events by target type
      .then(request =>
        super.handlingEventsByTypes(context, request, [
          TICKS_NEWTICK_EVENT.eventType
        ])
      )
      // Validate event by target schema
      .then(event =>
        super.validateEvents(event, TICKS_NEWTICK_EVENT.dataSchema)
      )
      // Handling ticks
      .then(tickEvent => handleTick(context, tickEvent))
      // Calling context.done for finalize function
      .then(() => {
        Log.request(context.req, context.res);
        context.done();
      })
      .catch(error => {
        Log.error(error);
        context.done();
      });
  }

  timerEvent(context, timer) {
    Log.addContext(context);
    const timeStamp = new Date().toISOString();

    if (timer.isPastDue) {
      Log.warn("Timer trigger is running late!");
    }
    Log.debug("Timer trigger function ran!", timeStamp);
    handleTimers(context);
    // TODO: Log.clearContext();
  }
}

async function handleTimers(context) {
  await positionsTimer(context);
  await tradersTimer(context);
}

const service = new TraderService();

export default service;

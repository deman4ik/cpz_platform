import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import BaseService from "cpz/services/baseService";
import controlApiEnv from "cpz/config/environment/control";
import EventGrid from "cpz/events";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT
} from "cpz/events/types/base";
import { ERROR_CONTROL_ERROR_EVENT } from "cpz/events/types/error";
import {
  TASKS_ADVISER_STARTED_EVENT_SCHEMA,
  TASKS_ADVISER_STOPPED_EVENT_SCHEMA,
  TASKS_ADVISER_UPDATED_EVENT_SCHEMA,
  TASKS_BACKTEST_STARTED_EVENT_SCHEMA,
  TASKS_BACKTEST_STOPPED_EVENT_SCHEMA,
  TASKS_BACKTEST_FINISHED_EVENT_SCHEMA,
  TASKS_BACKTESTER_STARTED_EVENT_SCHEMA,
  TASKS_BACKTESTER_STOPPED_EVENT_SCHEMA,
  TASKS_BACKTESTER_FINISHED_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_STARTED_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_STOPPED_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_UPDATED_EVENT_SCHEMA,
  TASKS_EXWATCHER_STARTED_EVENT_SCHEMA,
  TASKS_EXWATCHER_STOPPED_EVENT_SCHEMA,
  TASKS_EXWATCHER_UPDATED_EVENT_SCHEMA,
  TASKS_IMPORTER_STARTED_EVENT_SCHEMA,
  TASKS_IMPORTER_STOPPED_EVENT_SCHEMA,
  TASKS_IMPORTER_FINISHED_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_STARTED_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_STOPPED_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_UPDATED_EVENT_SCHEMA,
  TASKS_TRADER_STARTED_EVENT_SCHEMA,
  TASKS_TRADER_STOPPED_EVENT_SCHEMA,
  TASKS_TRADER_UPDATED_EVENT_SCHEMA,
  TASKS_USERROBOT_STARTED_EVENT_SCHEMA,
  TASKS_USERROBOT_STOPPED_EVENT_SCHEMA,
  TASKS_USERROBOT_UPDATED_EVENT_SCHEMA
} from "cpz/events/schemas/tasks";
import {
  ERROR_ADVISER_ERROR_EVENT_SCHEMA,
  ERROR_ADVISER_WARN_EVENT_SCHEMA,
  ERROR_BACKTEST_ERROR_EVENT_SCHEMA,
  ERROR_BACKTEST_WARN_EVENT_SCHEMA,
  ERROR_BACKTESTER_ERROR_EVENT_SCHEMA,
  ERROR_BACKTESTER_WARN_EVENT_SCHEMA,
  ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA,
  ERROR_CANDLEBATCHER_WARN_EVENT_SCHEMA,
  ERROR_EXWATCHER_ERROR_EVENT_SCHEMA,
  ERROR_EXWATCHER_WARN_EVENT_SCHEMA,
  ERROR_IMPORTER_ERROR_EVENT_SCHEMA,
  ERROR_IMPORTER_WARN_EVENT_SCHEMA,
  ERROR_MARKETWATCHER_ERROR_EVENT_SCHEMA,
  ERROR_MARKETWATCHER_WARN_EVENT_SCHEMA,
  ERROR_TRADER_ERROR_EVENT_SCHEMA,
  ERROR_TRADER_WARN_EVENT_SCHEMA,
  ERROR_USERROBOT_ERROR_EVENT_SCHEMA,
  ERROR_USERROBOT_WARN_EVENT_SCHEMA
} from "cpz/events/schemas/error";
import { SERVICE_NAME } from "../config";
import {
  handleFinished,
  handleStarted,
  handleStopped,
  handleUpdated
} from "../taskrunner/handleServiceEvents";

class ServiceEvents extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(controlApiEnv.variables);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: SERVICE_NAME
    });
    // Configure Validator
    ServiceValidator.add([
      TASKS_ADVISER_STARTED_EVENT_SCHEMA,
      TASKS_ADVISER_STOPPED_EVENT_SCHEMA,
      TASKS_ADVISER_UPDATED_EVENT_SCHEMA,
      TASKS_BACKTEST_STARTED_EVENT_SCHEMA,
      TASKS_BACKTEST_STOPPED_EVENT_SCHEMA,
      TASKS_BACKTEST_FINISHED_EVENT_SCHEMA,
      TASKS_BACKTESTER_STARTED_EVENT_SCHEMA,
      TASKS_BACKTESTER_STOPPED_EVENT_SCHEMA,
      TASKS_BACKTESTER_FINISHED_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_STARTED_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_STOPPED_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_UPDATED_EVENT_SCHEMA,
      TASKS_EXWATCHER_STARTED_EVENT_SCHEMA,
      TASKS_EXWATCHER_STOPPED_EVENT_SCHEMA,
      TASKS_EXWATCHER_UPDATED_EVENT_SCHEMA,
      TASKS_IMPORTER_STARTED_EVENT_SCHEMA,
      TASKS_IMPORTER_STOPPED_EVENT_SCHEMA,
      TASKS_IMPORTER_FINISHED_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_STARTED_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_STOPPED_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_UPDATED_EVENT_SCHEMA,
      TASKS_TRADER_STARTED_EVENT_SCHEMA,
      TASKS_TRADER_STOPPED_EVENT_SCHEMA,
      TASKS_TRADER_UPDATED_EVENT_SCHEMA,
      TASKS_USERROBOT_STARTED_EVENT_SCHEMA,
      TASKS_USERROBOT_STOPPED_EVENT_SCHEMA,
      TASKS_USERROBOT_UPDATED_EVENT_SCHEMA,
      ERROR_ADVISER_ERROR_EVENT_SCHEMA,
      ERROR_ADVISER_WARN_EVENT_SCHEMA,
      ERROR_BACKTEST_ERROR_EVENT_SCHEMA,
      ERROR_BACKTEST_WARN_EVENT_SCHEMA,
      ERROR_BACKTESTER_ERROR_EVENT_SCHEMA,
      ERROR_BACKTESTER_WARN_EVENT_SCHEMA,
      ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA,
      ERROR_CANDLEBATCHER_WARN_EVENT_SCHEMA,
      ERROR_EXWATCHER_ERROR_EVENT_SCHEMA,
      ERROR_EXWATCHER_WARN_EVENT_SCHEMA,
      ERROR_IMPORTER_ERROR_EVENT_SCHEMA,
      ERROR_IMPORTER_WARN_EVENT_SCHEMA,
      ERROR_MARKETWATCHER_ERROR_EVENT_SCHEMA,
      ERROR_MARKETWATCHER_WARN_EVENT_SCHEMA,
      ERROR_TRADER_ERROR_EVENT_SCHEMA,
      ERROR_TRADER_WARN_EVENT_SCHEMA,
      ERROR_USERROBOT_ERROR_EVENT_SCHEMA,
      ERROR_USERROBOT_WARN_EVENT_SCHEMA
    ]);
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

    // Handling events by target type
    const event = this.handlingEventsByTypes(context, req);

    if (event) {
      const { eventType, subject, data } = event;
      try {
        // Validate events by target schema
        ServiceValidator.check(BASE_EVENT, data);

        if (eventType.includes(".Started")) {
          await handleStarted(context, { subject, eventType, ...data });
        } else if (eventType.includes(".Stopped")) {
          await handleStopped(context, { subject, eventType, ...data });
        } else if (eventType.includes(".Updated")) {
          await handleUpdated(context, { subject, eventType, ...data });
        } else if (eventType.includes(".Finished")) {
          await handleFinished(context, { subject, eventType, ...data });
        }
        // Calling context.done for finalize function
        context.done();
      } catch (error) {
        Log.error(error);
        await EventGrid.publish(ERROR_CONTROL_ERROR_EVENT, 
          {
          subject: "ControlApiError",
          data: { error: error.json }
          );
      }
    }
    Log.request(context.req, context.res);
    Log.clearContext();
    context.done();
  }

  /** @override */
  handlingEventsByTypes(context, req) {
    const events = req.body;
    // All filteredEvents is same one type
    // Hack for https://github.com/MicrosoftDocs/azure-docs/issues/14325
    if (events.length > 1) {
      Log.error(
        "Microsoft has changes event policy about eventGrid body length"
      );
    }
    // Getting first event for check his type
    const [event] = events;

    if (event.eventType === SUB_VALIDATION_EVENT) {
      Log.info(
        `Got ${event.eventType} event, validationCode: ${
          event.validationCode
        }, topic: ${event.topic}`
      );
      context.res = {
        status: 200,
        body: {
          validationResponse: event.validationCode
        },
        headers: {
          "Content-Type": "application/json"
        }
      };
      Log.request(context.req, context.res);
      Log.clearContext();
      context.done();
    } else if (event.eventType === SUB_DELETED_EVENT) {
      Log.info(`Got ${event.eventType} event: , topic: ${event.topic}`);
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      };
      Log.request(context.req, context.res);
      Log.clearContext();
      context.done();
      // In this place if Event Grid batch, we expect what all events are same one type
      // Search in EVENT TYPE needed status of end of string
    } else if (
      event.eventType.search(/.Started$|.Stopped$|.Updated$|.Finished$/) !== -1
    ) {
      Log.info(
        `Got ${event.eventType} event, data ${JSON.stringify(event.data)}`
      );
    } else {
      Log.error(`Unknown Event Type: ${event.eventType}`);
      Log.request(context.req, context.res);
      Log.clearContext();
      context.done();
    }
    return event;
  }
}

const service = new ServiceEvents();

export default service;

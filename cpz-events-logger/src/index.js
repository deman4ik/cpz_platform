import "babel-polyfill";
import BaseService from "cpz/services/baseService";
import { checkEnvVars } from "cpz/utils/environment";
import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import eventsloggerEnv from "cpz/config/environment/eventslogger";
import config from "./config";
import EventsLogger from "./eventslogger/eventslogger";
import Relay from "./emulator/relay";

const { EG_EMULATOR_MODE, API_KEY } = process.env;

const {
  events: {
    types: { SUB_DELETED_EVENT, SUB_VALIDATION_EVENT }
  }
} = config;

class EventsLoggerService extends BaseService {
  constructor() {
    super();
    this.config = config;
    this.relay = new Relay(EG_EMULATOR_MODE, API_KEY);
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(eventsloggerEnv.variables);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: this.config.serviceName
    });
    // Configure Validator
    ServiceValidator.add(this.config.events.schemas);
  }

  async handleEvent(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    super.checkAuth(context, req);
    // Handling event by target type
    const event = this.handlingEventsByTypes(context, req);
    if (event) {
      try {
        const eventslogger = new EventsLogger(context);
        await eventslogger.save(event);

        if (EG_EMULATOR_MODE) {
          await this.relay.send(context, event);
        }
      } catch (error) {
        Log.error(error);
      }
    }
    // Calling context.done for finalize function
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
    } else {
      Log.info(
        `Got ${event.eventType} event, data ${JSON.stringify(event.data)}`
      );
    }
    return event;
  }
}

const service = new EventsLoggerService();

export default service;

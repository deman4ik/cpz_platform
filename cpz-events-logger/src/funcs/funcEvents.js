import BaseService from "cpz/services/baseService";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import {
  SUB_DELETED_EVENT,
  SUB_VALIDATION_EVENT,
  BASE_EVENT
} from "cpz/events/types/base";
import { BASE_EVENT_SCHEMA } from "cpz/events/schemas/base";
import eventsloggerEnv from "cpz/config/environment/eventslogger";
import EventsStorageClient from "cpz/tableStorage-client/events";
import eventsTables from "cpz/tableStorage-client/events/events";
import MarketStorageClient from "cpz/tableStorage-client/market";
import marketTables from "cpz/tableStorage-client/market/currentPrices";
import { SERVICE_NAME } from "../config";
import EventsLogger from "../eventslogger/eventslogger";
import Relay from "../emulator/relay";

class FuncEvents extends BaseService {
  constructor() {
    super();

    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(eventsloggerEnv);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: SERVICE_NAME
    });
    // Configure Validator
    const schemas = super.ValidatorConfig([BASE_EVENT_SCHEMA]);
    ServiceValidator.add(schemas);
    EventsStorageClient.init(process.env.AZ_STORAGE_EVENT_CS, eventsTables);
    MarketStorageClient.init(process.env.AZ_STORAGE_MARKET_CS, marketTables);
    this.eventslogger = new EventsLogger();
    this.relay = new Relay(process.env.EG_EMULATOR_MODE, process.env.API_KEY);
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
          event.data.validationCode
        }, topic: ${event.topic}`
      );
      context.res = {
        status: 200,
        body: {
          validationResponse: event.data.validationCode
        },
        headers: {
          "Content-Type": "application/json"
        }
      };
      return null;
    }
    if (event.eventType === SUB_DELETED_EVENT) {
      Log.info(`Got ${event.eventType} event: , topic: ${event.topic}`);
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      };
      return null;
      // In this place if Event Grid batch, we expect what all events are same one type
    }
    Log.info(
      `Got ${event.eventType} event, data ${JSON.stringify(event.data)}`
    );
    return event;
  }

  async run(context, req) {
    Log.addContext(context);
    // Checking that request is authorized
    if (process.env.EG_EMULATOR_MODE || super.checkAuth(context, req)) {
      // Handling event by target type
      const event = this.handlingEventsByTypes(context, req);
      if (event) {
        try {
          if (!process.env.EG_EMULATOR_MODE)
            ServiceValidator.check(BASE_EVENT, event);
          await this.eventslogger.save(event);

          if (process.env.EG_EMULATOR_MODE) {
            await this.relay.send(event);
          }
        } catch (e) {
          let error;
          if (e instanceof ServiceError) {
            error = e;
          } else {
            error = new ServiceError(
              {
                name: ServiceError.types.EVENTSLOGGER_HANDLE_EVENT_ERROR
              },
              "Failed to handle event."
            );
          }

          Log.exception(error.json);
        }
      }
    }
    // Calling context.done for finalize function
    Log.request(context.req, context.res);
    Log.clearContext();
  }
}

const func = new FuncEvents();

export default func;

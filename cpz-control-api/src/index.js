import "babel-polyfill";
import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import BaseService from "cpz/services/baseService";
import controlApiEnv from "cpz/config/environment/control";
import EventGrid from "cpz/events";
import {
  ApolloServer,
  AuthenticationError
} from "apollo-server-azure-functions";
import VError from "verror";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import {
  handleFinished,
  handleStarted,
  handleStopped,
  handleUpdated
} from "./taskrunner/handleTaskEvents";
import config from "./config";
import typeDefs from "./api/schema/schema.graphql";
import mutations from "./api/resolvers/mutations";

const {
  events: {
    types: { ERROR_CONTROL_EVENT }
  }
} = config;

class ControlApiService extends BaseService {
  constructor() {
    super();
    this.config = config;
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(controlApiEnv.variables);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: this.config.serviceName
    });
    // TODO Add schemas??
    // Configure Validator
    ServiceValidator.add(this.config.events.schemas);
    // Configure Event Grid Client
    // TODO Add topics??
    const EGConfig = super.EGConfig(this.config.events.topics);
    EventGrid.config(EGConfig);
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

    const { BASE_EVENT } = this.config.events.types;

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
        await EventGrid.publish(ERROR_CONTROL_EVENT, error.json);
      }
    }
    Log.request(context.req, context.res);
    Log.clearContext();
    context.done();
  }

  graphql() {
    const resolvers = {
      JSON: GraphQLJSON,
      Datetime: GraphQLDateTime,
      Query: {
        ping: () => new Date().toISOString()
      },
      Mutation: mutations
    };

    const server = new ApolloServer({
      playground: true,
      introspection: true,
      typeDefs,
      resolvers,
      formatError: error => {
        const err = new VError(
          { name: "ConnectorError", cause: error },
          "Failed to process request"
        );
        Log.exception(err);
        // TODO format with ServiceError
        return error;
        // Or, you can delete the exception information
        // delete error.extensions.exception;
        // return error;
      },
      context: req => {
        Log.addContext(req.context);
        if (req.request.headers["api-key"] !== process.env.API_KEY)
          throw new AuthenticationError("Invalid API Key");
        return {
          apiKey: req.request.headers["api-key"],
          context: req.context
        };
      }
    });
    return server.createHandler();
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

    const {
      SUB_VALIDATION_EVENT,
      SUB_DELETED_EVENT
    } = this.config.events.types;

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

const service = new ControlApiService();

export default service;

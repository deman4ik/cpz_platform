import {
  ApolloServer,
  AuthenticationError
} from "apollo-server-azure-functions";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import BaseService from "cpz/services/baseService";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import controlApiEnv from "cpz/config/environment/control";
import EventGrid from "cpz/events";
import { TASKS_TOPIC, LOG_TOPIC, ERROR_TOPIC } from "cpz/events/topics";
import {
  TASKS_ADVISER_START_EVENT_SCHEMA,
  BACKTEST_START_SCHEMA,
  BACKTEST_STOP_SCHEMA,
  TASKS_BACKTESTER_START_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_START_EVENT_SCHEMA,
  EXWATCHER_START_SCHEMA,
  TASKS_IMPORTER_START_EVENT_SCHEMA,
  TASKS_IMPORTER_STOP_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_START_EVENT_SCHEMA,
  TASKS_TRADER_START_EVENT_SCHEMA,
  USER_ROBOT_START_SCHEMA,
  USER_ROBOT_STOP_SCHEMA,
  USER_ROBOT_UPDATE_SCHEMA
} from "cpz/events/schemas/tasks";
import {
  ERROR_CONTROL_ERROR_EVENT_SCHEMA,
  ERROR_BACKTEST_ERROR_EVENT_SCHEMA,
  ERROR_EXWATCHER_ERROR_EVENT_SCHEMA,
  ERROR_USERROBOT_ERROR_EVENT_SCHEMA
} from "cpz/events/schemas/error";
import DB from "cpz/db-client";
import ControlStorageClient from "cpz/tableStorage-client/control";
import adviserTables from "cpz/tableStorage-client/control/advisers";
import backtestTables from "cpz/tableStorage-client/control/backtests";
import candlebatcherTables from "cpz/tableStorage-client/control/candlebatchers";
import exwatcherTables from "cpz/tableStorage-client/control/exwatchers";
import importerTables from "cpz/tableStorage-client/control/importers";
import marketwatcherTables from "cpz/tableStorage-client/control/marketwatchers";
import traderTables from "cpz/tableStorage-client/control/traders";
import userRobotTables from "cpz/tableStorage-client/control/userRobots";
import EventsStorageClient from "cpz/tableStorage-client/events";
import eventTables from "cpz/tableStorage-client/events/events";
import BacktesterStorageClient from "cpz/tableStorage-client/backtest";
import backtesterTables from "cpz/tableStorage-client/backtest/backtesters";
import EventHub from "cpz/eventhub-client";
import { SERVICE_NAME } from "../config";
import typeDefs from "../api/schema/schema.graphql";
import mutations from "../api/resolvers/mutations";

class Graphql extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(controlApiEnv);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: SERVICE_NAME
    });
    DB.init(process.env.DB_API_ENDPOINT, process.env.DB_API_ACCESS_KEY);
    // Configure Validator
    const schemas = super.ValidatorConfig([
      TASKS_ADVISER_START_EVENT_SCHEMA,
      BACKTEST_START_SCHEMA,
      BACKTEST_STOP_SCHEMA,
      TASKS_BACKTESTER_START_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_START_EVENT_SCHEMA,
      EXWATCHER_START_SCHEMA,
      TASKS_IMPORTER_START_EVENT_SCHEMA,
      TASKS_IMPORTER_STOP_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_START_EVENT_SCHEMA,
      TASKS_TRADER_START_EVENT_SCHEMA,
      USER_ROBOT_START_SCHEMA,
      USER_ROBOT_STOP_SCHEMA,
      USER_ROBOT_UPDATE_SCHEMA,
      ERROR_BACKTEST_ERROR_EVENT_SCHEMA,
      ERROR_EXWATCHER_ERROR_EVENT_SCHEMA,
      ERROR_USERROBOT_ERROR_EVENT_SCHEMA,
      ERROR_CONTROL_ERROR_EVENT_SCHEMA
    ]);
    ServiceValidator.add(schemas);
    // Configure Event Grid Client
    const EGConfig = super.EGConfig([TASKS_TOPIC, LOG_TOPIC, ERROR_TOPIC]);
    EventGrid.config(EGConfig);
    // Table Storage
    ControlStorageClient.init(process.env.AZ_STORAGE_CONTROL_CS, [
      ...adviserTables,
      ...backtestTables,
      ...candlebatcherTables,
      ...exwatcherTables,
      ...importerTables,
      ...marketwatcherTables,
      ...traderTables,
      ...userRobotTables
    ]);
    EventsStorageClient.init(process.env.AZ_STORAGE_EVENT_CS, eventTables);
    BacktesterStorageClient.init(
      process.env.AZ_STORAGE_BACKTESTER_CS,
      backtesterTables
    );
    // Event Hub
    EventHub.init(
      process.env.TASKRUNNER_EVENTHUB,
      process.env.TASKRUNNER_EVENTHUB_NAME
    );
    this.run = this.graphqlServer();
  }

  graphqlServer() {
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
        const err = new ServiceError(
          { name: ServiceError.types.CONTROL_API_ERROR, cause: error },
          "Failed to process request"
        );
        Log.exception(err);

        return err.json;
        // Or, you can delete the exception information
        // delete error.extensions.exception;
        // return error;
      },
      context: req => {
        Log.addContext(req.context);
        if (req.request.headers["api-key"] !== process.env.API_KEY)
          throw new AuthenticationError("Invalid API Key");
        return {
          context: req.context
        };
      }
    });
    return server.createHandler();
  }
}

const func = new Graphql();

export default func;

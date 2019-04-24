import Log from "cpz/log";
import ServiceError from "cpz/error";
import BaseService from "cpz/services/baseService";
import ServiceValidator from "cpz/validator";
import { checkEnvVars } from "cpz/utils/environment";
import controlApiEnv from "cpz/config/environment/control";
import EventGrid from "cpz/events";
import { TASKS_TOPIC, LOG_TOPIC, ERROR_TOPIC } from "cpz/events/topics";
import {
  TASKS_ADVISER_START_EVENT_SCHEMA,
  TASKS_ADVISER_STOP_EVENT_SCHEMA,
  TASKS_ADVISER_UPDATE_EVENT_SCHEMA,
  BACKTEST_START_SCHEMA,
  BACKTEST_STOP_SCHEMA,
  TASKS_BACKTEST_STARTED_EVENT_SCHEMA,
  TASKS_BACKTEST_STOPPED_EVENT_SCHEMA,
  TASKS_BACKTEST_FINISHED_EVENT_SCHEMA,
  TASKS_BACKTESTER_START_EVENT_SCHEMA,
  TASKS_BACKTESTER_STOP_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_START_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_STOP_EVENT_SCHEMA,
  TASKS_CANDLEBATCHER_UPDATE_EVENT_SCHEMA,
  EXWATCHER_START_SCHEMA,
  TASKS_EXWATCHER_STARTED_EVENT_SCHEMA,
  TASKS_EXWATCHER_STOPPED_EVENT_SCHEMA,
  TASKS_IMPORTER_START_EVENT_SCHEMA,
  TASKS_IMPORTER_STOP_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_START_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_STOP_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT_SCHEMA,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT_SCHEMA,
  TASKS_TRADER_START_EVENT_SCHEMA,
  TASKS_TRADER_STOP_EVENT_SCHEMA,
  TASKS_TRADER_UPDATE_EVENT_SCHEMA,
  USER_ROBOT_START_SCHEMA,
  USER_ROBOT_STOP_SCHEMA,
  USER_ROBOT_UPDATE_SCHEMA,
  TASKS_USERROBOT_HIST_EVENT_SCHEMA
} from "cpz/events/schemas/tasks";
import {
  ERROR_ADVISER_ERROR_EVENT_SCHEMA,
  ERROR_BACKTEST_ERROR_EVENT_SCHEMA,
  ERROR_BACKTESTER_ERROR_EVENT_SCHEMA,
  ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA,
  ERROR_EXWATCHER_ERROR_EVENT_SCHEMA,
  ERROR_IMPORTER_ERROR_EVENT_SCHEMA,
  ERROR_MARKETWATCHER_ERROR_EVENT_SCHEMA,
  ERROR_TRADER_ERROR_EVENT_SCHEMA,
  ERROR_USERROBOT_ERROR_EVENT_SCHEMA,
  ERROR_CONTROL_ERROR_EVENT_SCHEMA
} from "cpz/events/schemas/error";
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
import {
  EXWATCHER_SERVICE,
  USERROBOT_SERVICE,
  BACKTEST_SERVICE
} from "cpz/config/services";
import DB from "cpz/db-client";
import { SERVICE_NAME } from "../config";
import ExWatcherRunner from "../taskrunner/tasks/exwatcherRunner";
import UserRobotRunner from "../taskrunner/tasks/userRobotRunner";
import BacktestRunner from "../taskrunner/tasks/backtestRunner";

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
    DB.init(process.env.DB_API_ENDPOINT, process.env.DB_API_ACCESS_KEY);
    const schemas = super.ValidatorConfig([
      TASKS_ADVISER_START_EVENT_SCHEMA,
      TASKS_ADVISER_STOP_EVENT_SCHEMA,
      TASKS_ADVISER_UPDATE_EVENT_SCHEMA,
      BACKTEST_START_SCHEMA,
      BACKTEST_STOP_SCHEMA,
      TASKS_BACKTEST_STARTED_EVENT_SCHEMA,
      TASKS_BACKTEST_STOPPED_EVENT_SCHEMA,
      TASKS_BACKTEST_FINISHED_EVENT_SCHEMA,
      TASKS_BACKTESTER_START_EVENT_SCHEMA,
      TASKS_BACKTESTER_STOP_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_START_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_STOP_EVENT_SCHEMA,
      TASKS_CANDLEBATCHER_UPDATE_EVENT_SCHEMA,
      EXWATCHER_START_SCHEMA,
      TASKS_EXWATCHER_STARTED_EVENT_SCHEMA,
      TASKS_EXWATCHER_STOPPED_EVENT_SCHEMA,
      TASKS_IMPORTER_START_EVENT_SCHEMA,
      TASKS_IMPORTER_STOP_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_START_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_STOP_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_SUBSCRIBE_EVENT_SCHEMA,
      TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT_SCHEMA,
      TASKS_TRADER_START_EVENT_SCHEMA,
      TASKS_TRADER_STOP_EVENT_SCHEMA,
      TASKS_TRADER_UPDATE_EVENT_SCHEMA,
      USER_ROBOT_START_SCHEMA,
      USER_ROBOT_STOP_SCHEMA,
      USER_ROBOT_UPDATE_SCHEMA,
      TASKS_USERROBOT_HIST_EVENT_SCHEMA,
      ERROR_ADVISER_ERROR_EVENT_SCHEMA,
      ERROR_BACKTEST_ERROR_EVENT_SCHEMA,
      ERROR_BACKTESTER_ERROR_EVENT_SCHEMA,
      ERROR_CANDLEBATCHER_ERROR_EVENT_SCHEMA,
      ERROR_EXWATCHER_ERROR_EVENT_SCHEMA,
      ERROR_IMPORTER_ERROR_EVENT_SCHEMA,
      ERROR_MARKETWATCHER_ERROR_EVENT_SCHEMA,
      ERROR_TRADER_ERROR_EVENT_SCHEMA,
      ERROR_USERROBOT_ERROR_EVENT_SCHEMA,
      ERROR_CONTROL_ERROR_EVENT_SCHEMA
    ]);
    // Configure Validator
    ServiceValidator.add(schemas);
    // Configure Event Grid Client
    const EGConfig = super.EGConfig({
      TASKS_TOPIC,
      LOG_TOPIC,
      ERROR_TOPIC
    });
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
  }

  /**
   * Run tasks
   *
   * @method
   * @param {Object} context - context of Azure Function
   * @param {Object} req - EventHub trigger with Event Data
   */
  async run(context, messages) {
    Log.addContext(context);
    await Promise.all(
      messages.map(async message => {
        try {
          const { service } = message;
          if (service === EXWATCHER_SERVICE) {
            await ExWatcherRunner.handleAction(message);
          } else if (service === USERROBOT_SERVICE) {
            await UserRobotRunner.handleAction(message);
          } else if (service === BACKTEST_SERVICE) {
            await BacktestRunner.handleAction(message);
          } else {
            Log.error(`Unkown action ${JSON.stringify(message)}`);
          }
        } catch (e) {
          const error = new ServiceError(
            {
              name: ServiceError.types.CONTROL_TASK_RUNNER_ERROR,
              cause: e,
              info: { ...message }
            },
            "Failed to execute task."
          );
          Log.exception(error);
          // TODO: Send event
        }
      })
    );
    Log.clearContext();
  }
}

const service = new ServiceEvents();

export default service;

import ServiceError from "cpz/error";
import dayjs from "cpz/utils/dayjs";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_FINISHED
} from "cpz/config/state";
import { BACKTEST_START } from "cpz/events/types/tasks/backtest";
import {
  getBacktestById,
  saveBacktestState
} from "cpz/tableStorage-client/control/backtests";
import {
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_STOPPED_EVENT,
  TASKS_IMPORTER_FINISHED_EVENT,
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_STOPPED_EVENT,
  TASKS_BACKTESTER_FINISHED_EVENT
} from "cpz/events/types/tasks";
import {
  ERROR_IMPORTER_ERROR_EVENT,
  ERROR_BACKTESTER_ERROR_EVENT
} from "cpz/events/types/error";
import { IMPORTER_IMPORT_CANDLES_MODE } from "cpz/config/state/types";
import { durationInTimeframe } from "cpz/utils/helpers";
import { countCandlesDB } from "cpz/db-client/candles";
import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";
import BacktesterRunner from "../services/backtesterRunner";
import ImporterRunner from "../services/importerRunner";
import Backtest from "./backtest";
import publishEvents from "../../utils/publishEvents";

class BacktestRunner extends BaseRunner {
  static async getState(taskId) {
    try {
      const state = await getBacktestById(taskId);
      if (!state)
        throw new ServiceError(
          {
            name: ServiceError.types.BACKTEST_NOT_FOUND_ERROR,
            info: { taskId }
          },
          "Failed to load Backtest state."
        );
      return state;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.BACKTEST_RUNNER_ERROR,
          cause: e,
          info: { taskId }
        },
        "Failed to get Backtest state."
      );
      Log.error(error);
      throw error;
    }
  }

  static async handleAction(action) {
    try {
      const { type, taskId, data } = action;
      const state = await BacktestRunner.getState(taskId);

      if (type === "event") {
        BacktestRunner.handleEvent(state, data);
      } else if (type === "start") {
        BacktestRunner.start(state);
      } else if (type === "stop") {
        BacktestRunner.stop(state);
      } else {
        Log.error(`Unknown Backtest action type - ${type}`);
      }
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.BACKTEST_RUNNER_ERROR,
          cause: e,
          info: { action }
        },
        "Failed to handle action with Backtest"
      );
      Log.error(error);
      throw error;
    }
  }

  static async handleEvent(state, event) {
    const backtest = new Backtest(state);
    try {
      const {
        eventType,
        data: { error }
      } = event;

      // Importer
      if (eventType === TASKS_IMPORTER_STARTED_EVENT) {
        backtest.importerStatus = STATUS_STARTED;
      } else if (eventType === TASKS_IMPORTER_FINISHED_EVENT) {
        backtest.importerStatus = STATUS_FINISHED;
      } else if (eventType === TASKS_IMPORTER_STOPPED_EVENT) {
        backtest.importerStatus = STATUS_STOPPED;
      } else if (eventType === ERROR_IMPORTER_ERROR_EVENT) {
        backtest.importerError = error;
      }

      // Backtester
      else if (eventType === TASKS_BACKTESTER_STARTED_EVENT) {
        backtest.backtesterStatus = STATUS_STARTED;
      } else if (eventType === TASKS_BACKTESTER_STOPPED_EVENT) {
        backtest.backtesterStatus = STATUS_STOPPED;
      } else if (eventType === TASKS_BACKTESTER_FINISHED_EVENT) {
        backtest.backtesterStatus = STATUS_FINISHED;
      } else if (eventType === ERROR_BACKTESTER_ERROR_EVENT) {
        backtest.backtesterError = error;
      }

      await saveBacktestState(backtest.state);
      await publishEvents(backtest.events);

      if (backtest.status === STATUS_STARTING) {
        BacktestRunner.start(backtest.state);
      }
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.BACKTEST_RUNNER_ERROR,
          cause: e,
          info: { ...state }
        },
        "Failed to handle service event with Backtest."
      );
      Log.error(error);
      backtest.error = error.main;
      await publishEvents(backtest.events);
    }
  }

  static async start(state) {
    const backtest = new Backtest(state);
    try {
      ServiceValidator.check(BACKTEST_START, state);

      backtest.status = STATUS_STARTING;

      const events = [];
      if (
        backtest.importerStatus !== STATUS_STARTED &&
        backtest.importerStatus !== STATUS_FINISHED
      ) {
        let dateFrom;
        ({ dateFrom } = backtest);
        if (backtest.adviserSettings.requiredHistoryMaxBars > 0) {
          dateFrom = dayjs
            .utc(backtest.dateFrom)
            .add(
              -backtest.adviserSettings.requiredHistoryMaxBars *
                backtest.timeframe,
              "minute"
            )
            .toISOString();
        }

        const totalBarsInDb = await countCandlesDB({
          exchange: backtest.exchange,
          asset: backtest.asset,
          currency: backtest.currency,
          timeframe: backtest.timeframe,
          dateFrom,
          dateTo: backtest.dateTo
        });

        const expectedBars = durationInTimeframe(
          dateFrom,
          backtest.dateTo,
          backtest.timeframe
        );

        if (totalBarsInDb < expectedBars) {
          const importerParams = {
            exchange: backtest.exchange,
            asset: backtest.asset,
            currency: backtest.currency,
            mode: IMPORTER_IMPORT_CANDLES_MODE,
            settings: {
              importCandles: {
                dateFrom,
                dateTo: backtest.dateTo,
                saveToCache: false
              }
            }
          };

          const { taskId, status, event } = await ImporterRunner.start(
            importerParams
          );
          backtest.importerId = taskId;
          backtest.importerStatus = status;
          if (event) events.push(event);
        } else {
          backtest.importerStatus = STATUS_FINISHED;
        }
      }

      if (
        backtest.importerStatus === STATUS_FINISHED &&
        backtest.backtesterStatus !== STATUS_STARTING &&
        backtest.backtesterStatus !== STATUS_STARTED &&
        backtest.backtesterStatus !== STATUS_FINISHED
      ) {
        const backtesterParams = {
          taskId: backtest.backtesterId,
          robotId: backtest.robotId,
          userId: backtest.userId,
          strategyName: backtest.strategyName,
          exchange: backtest.exchange,
          asset: backtest.asset,
          currency: backtest.currency,
          timeframe: backtest.timeframe,
          dateFrom: backtest.dateFrom,
          dateTo: backtest.dateTo,
          settings: backtest.settings,
          adviserSettings: backtest.adviserSettings,
          traderSettings: backtest.traderSettings
        };

        const { taskId, status, event } = await BacktesterRunner.start(
          backtesterParams
        );
        backtest.backtesterId = taskId;
        backtest.backtesterStatus = status;
        if (event) events.push(event);
      }

      await saveBacktestState(backtest.state);
      await publishEvents(events);
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.BACKTEST_RUNNER_ERROR,
          cause: e,
          info: state
        },
        "Failed to start Backtest"
      );
      Log.error(error);
      backtest.error = error.main;
      await publishEvents(backtest.events);
    }
    return {
      taskId: backtest.taskId,
      status: backtest.status
    };
  }

  static async stop(state) {
    const backtest = new Backtest(state);
    try {
      backtest.status = STATUS_STOPPING;

      const events = [];
      if (
        backtest.status === STATUS_STOPPED ||
        backtest.status === STATUS_FINISHED
      )
        return {
          taskId: backtest.taskId,
          status: backtest.status
        };

      if (
        backtest.importerStatus !== STATUS_STOPPED &&
        backtest.importerStatus !== STATUS_FINISHED
      ) {
        const { taskId, status, event } = await ImporterRunner.stop({
          taskId: backtest.importerId
        });
        backtest.importerId = taskId;
        backtest.importerStatus = status;
        if (event) events.push(event);
      }

      if (
        backtest.backtesterStatus !== STATUS_STOPPED &&
        backtest.backtesterStatus !== STATUS_FINISHED
      ) {
        const { taskId, status, event } = await BacktesterRunner.stop({
          taskId: backtest.backtesterId
        });
        backtest.backtesterId = taskId;
        backtest.backtesterStatus = status;
        if (event) events.push(event);
      }

      await saveBacktestState(backtest.state);
      await publishEvents(events);
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.BACKTEST_RUNNER_ERROR,
          cause: e,
          info: state
        },
        "Failed to stop Backtest"
      );
      Log.error(error);
      backtest.error = error.main;
      await publishEvents(backtest.events);
    }
    return { taskId: backtest.taskId, status: backtest.status };
  }
}

export default BacktestRunner;

import ServiceError from "cpz/error";
import dayjs from "cpz/utils/lib/dayjs";
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
    try {
      const backtest = new Backtest(state);
      const { eventType } = event;

      // Importer
      if (eventType === TASKS_IMPORTER_STARTED_EVENT) {
        backtest.importerStatus = STATUS_STARTED;
      } else if (eventType === TASKS_IMPORTER_FINISHED_EVENT) {
        backtest.importerStatus = STATUS_FINISHED;
      } else if (eventType === TASKS_IMPORTER_STOPPED_EVENT) {
        backtest.importerStatus = STATUS_STOPPED;
      }

      // Backtester
      else if (eventType === TASKS_BACKTESTER_STARTED_EVENT) {
        backtest.backtesterStatus = STATUS_STARTED;
      } else if (eventType === TASKS_BACKTESTER_STOPPED_EVENT) {
        backtest.backtesterStatus = STATUS_STOPPED;
      } else if (eventType === TASKS_BACKTESTER_FINISHED_EVENT) {
        backtest.backtesterStatus = STATUS_FINISHED;
      }

      await saveBacktestState(backtest.state);
      await publishEvents(backtest.events);

      if (backtest.status === STATUS_STARTING) {
        BacktestRunner.start(backtest.state);
      }
      if (backtest.status === STATUS_STOPPING) {
        BacktestRunner.stop(backtest.state);
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
      throw error;
    }
  }

  static async start(state) {
    try {
      ServiceValidator.check(BACKTEST_START, state);

      const backtest = new Backtest(state);
      backtest.log("start");
      backtest.status = STATUS_STARTING;

      const events = [];
      if (
        backtest.importerStatus !== STATUS_STARTED &&
        backtest.importerStatus !== STATUS_FINISHED
      ) {
        backtest.log("Importer!");
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
            timeframes: backtest.timeframes,
            dateFrom,
            dateTo: backtest.dateTo,
            saveToCache: false
          };

          const { taskId, status, event } = await ImporterRunner.start(
            importerParams
          );
          backtest.importerId = taskId;
          backtest.importerStatus = status;
          events.push(event);
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
        backtest.log("Backtester!");
        const backtesterParams = {
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
        events.push(event);
      }

      await saveBacktestState(backtest.state);
      await publishEvents(events);

      return {
        taskId: backtest.taskId,
        status: backtest.status
      };
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
      throw error;
    }
  }

  static async stop(state) {
    try {
      const backtest = new Backtest(state);
      backtest.status = STATUS_STOPPING;
      backtest.log("stop");
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
        events.push(event);
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
        events.push(event);
      }

      await saveBacktestState(backtest.state);
      await publishEvents(events);

      return { taskId: backtest.taskId, status: backtest.status };
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
      throw error;
    }
  }
}

export default BacktestRunner;

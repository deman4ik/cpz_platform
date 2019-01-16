import VError from "verror";
import dayjs from "cpzDayjs";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_FINISHED
} from "cpzState";
import { getBacktestById } from "cpzStorage";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { getMaxTimeframeDateFrom } from "cpzUtils/candlesUtils";
import { countCandlesDB } from "cpzDB";
import BaseRunner from "../baseRunner";
import BacktesterRunner from "../services/backtesterRunner";
import ImporterRunner from "../services/importerRunner";
import Backtest from "./backtest";

const validateStart = createValidator(TASKS_BACKTESTER_START_EVENT.dataSchema);
const validateStop = createValidator(TASKS_BACKTESTER_STOP_EVENT.dataSchema);

class BacktestRunner extends BaseRunner {
  static async start(context, params) {
    try {
      genErrorIfExist(validateStart(params));
      let backtestState = params;
      const backtest = new Backtest(backtestState);
      context.log.info(`Backtest ${backtest.taskId}: start`);

      backtestState = backtest.getCurrentState();

      if (
        backtestState.importerStatus !== STATUS_STARTED &&
        backtestState.importerStatus !== STATUS_FINISHED
      ) {
        context.log.info("Importer!");
        let dateFrom = backtestState.dateFrom;
        if (backtestState.candlebatcherSettings.requiredHistoryMaxBars > 0) {
          dateFrom = dayjs(backtestState.dateFrom)
            .add(
              -backtestState.candlebatcherSettings.requiredHistoryMaxBars /
                backtestState.timeframe,
              "minute"
            )
            .toISOString();
        }

        const totalBarsInDb = await countCandlesDB({
          exchange: backtestState.exchange,
          asset: backtestState.asset,
          currency: backtestState.currency,
          timeframe: backtestState.timeframe,
          dateFrom,
          dateTo: backtestState.dateTo
        });

        const expectedBars = 0; // TODO

        if (totalBarsInDb < expectedBars) {
          const importerParams = {
            providerType: backtestState.candlebatcherProviderType,
            exchange: backtestState.exchange,
            asset: backtestState.asset,
            currency: backtestState.currency,
            timeframes: backtestState.timeframes,
            dateFrom,
            dateTo: backtestState.dateTo,
            saveToCache: false,
            proxy: backtestState.candlebatcherSettings.proxy
          };

          const result = await ImporterRunner.start(context, importerParams);
          backtest.importerId = result.taskId;
          backtest.importerStatus = result.status;
          await backtest.save();
          backtestState = backtest.getCurrentState();
        } else {
          backtest.importerStatus = STATUS_FINISHED;
          await backtest.save();
          backtestState = backtest.getCurrentState();
        }
      }

      if (
        backtestState.importerStatus === STATUS_FINISHED &&
        backtestState.backtesterStatus !== STATUS_STARTING &&
        backtestState.backtesterStatus !== STATUS_STARTED &&
        backtestState.backtesterStatus !== STATUS_FINISHED
      ) {
        context.log.info("Backtester!");
        const backtesterParams = {
          robotId: backtestState.robotId,
          userId: backtestState.userId,
          strategyName: backtestState.strategyName,
          exchange: backtestState.exchange,
          asset: backtestState.asset,
          currency: backtestState.currency,
          timeframe: backtestState.timeframe,
          dateFrom: backtestState.dateFrom,
          dateTo: backtestState.dateTo,
          settings: backtestState.settings,
          adviserSettings: backtestState.adviserSettings,
          traderSettings: backtestState.traderSettings
        };

        const result = await BacktesterRunner.start(context, backtesterParams);
        backtest.backtesterId = result.taskId;
        backtest.backtesterStatus = result.status;
        await backtest.save();
      }

      return {
        taskId: backtest.taskId,
        status: backtest.status
      };
    } catch (error) {
      const err = new VError(
        {
          name: "BacktestRunnerError",
          cause: error,
          info: params
        },
        "Failed to start Backtest"
      );
      context.log.error(err);
      throw err;
    }
  }

  static async stop(context, params) {
    try {
      genErrorIfExist(validateStop(params));
      const backtestState = await getBacktestById(params.taskId);
      if (!backtestState) throw new Error("BacktestNotFound");
      const backtest = new Backtest(backtestState);
      context.log.info(`Backtest ${params.taskId} stop`);
      if (
        backtest.status === STATUS_STOPPED ||
        backtest.status === STATUS_FINISHED
      )
        return {
          taskId: backtest.taskId,
          status: backtest.status
        };

      if (
        backtestState.importerStatus !== STATUS_STOPPED &&
        backtestState.importerStatus !== STATUS_FINISHED
      ) {
        const result = await ImporterRunner.stop(context, {
          taskId: backtestState.importerId
        });
        backtest.importerId = result.taskId;
        backtest.importerStatus = result.status;
      }

      if (
        backtestState.backtesterStatus !== STATUS_STOPPED &&
        backtestState.backtesterStatus !== STATUS_FINISHED
      ) {
        const result = await BacktesterRunner.stop(context, {
          taskId: backtestState.backtesterId
        });
        backtest.backtesterId = result.taskId;
        backtest.backtesterStatus = result.status;
      }

      await backtest.save();

      return { taskId: backtest.taskId, status: backtest.status };
    } catch (error) {
      const err = new VError(
        {
          name: "BacktestRunnerError",
          cause: error,
          info: params
        },
        "Failed to stop Backtest"
      );
      context.log.error(err);
      throw err;
    }
  }
}

export default BacktestRunner;
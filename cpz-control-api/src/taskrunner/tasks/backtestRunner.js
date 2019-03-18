import VError from "verror";
import dayjs from "cpz/utils/lib/dayjs";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_FINISHED
} from "cpz/config/state";
import { getBacktestById } from "cpz/tableStorage/backtests";
import { durationInTimeframe } from "cpz/utils/helpers";
import { countCandlesDB } from "cpz/db";
import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";
import BacktesterRunner from "../services/backtesterRunner";
import ImporterRunner from "../services/importerRunner";
import Backtest from "./backtest";

import config from "../../config";

const {
  events: {
    types: { BACKTEST_START_PARAMS, BACKTEST_STOP_PARAMS }
  }
} = config;

class BacktestRunner extends BaseRunner {
  static async start(context, params) {
    try {
      ServiceValidator.check(BACKTEST_START_PARAMS, params);
      let backtestState = params;
      const backtest = new Backtest(context, backtestState);
      backtest.log("start");

      backtestState = backtest.getCurrentState();

      if (
        backtestState.importerStatus !== STATUS_STARTED &&
        backtestState.importerStatus !== STATUS_FINISHED
      ) {
        backtest.log("Importer!");
        let dateFrom;
        ({ dateFrom } = backtestState);
        if (backtestState.adviserSettings.requiredHistoryMaxBars > 0) {
          dateFrom = dayjs
            .utc(backtestState.dateFrom)
            .add(
              -backtestState.adviserSettings.requiredHistoryMaxBars *
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

        const expectedBars = durationInTimeframe(
          dateFrom,
          backtestState.dateTo,
          backtestState.timeframe
        );

        if (totalBarsInDb < expectedBars) {
          const importerParams = {
            exchange: backtestState.exchange,
            asset: backtestState.asset,
            currency: backtestState.currency,
            timeframes: backtestState.timeframes,
            dateFrom,
            dateTo: backtestState.dateTo,
            saveToCache: false
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
        backtest.log("Backtester!");
        const backtesterParams = {
          taskId: backtestState.backtesterId,
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
      Log.error(err);
      throw err;
    }
  }

  static async stop(context, params) {
    try {
      ServiceValidator.check(BACKTEST_STOP_PARAMS, params);
      const backtestState = await getBacktestById(params.taskId);
      if (!backtestState) throw new Error("BacktestNotFound");
      const backtest = new Backtest(context, backtestState);
      backtest.log("stop");
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
      Log.error(err);
      throw err;
    }
  }
}

export default BacktestRunner;

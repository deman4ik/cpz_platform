import VError from "verror";
import dayjs from "cpzDayjs";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_FINISHED,
  createWatcherSlug
} from "cpzState";
import { getExWatcherById, deleteExWatcherState } from "cpzStorage/exwatchers";
import {
  EXWATCHER_START_PARAMS,
  EXWATCHER_STOP_PARAMS,
  EXWATCHER_UPDATE_PARAMS
} from "cpzEventTypes";
import Log from "cpzLog";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { getMaxTimeframeDateFrom } from "cpzUtils/candlesUtils";
import BaseRunner from "../baseRunner";
import ExWatcher from "./exwatcher";
import CandlebatcherRunner from "../services/candlebatcherRunner";
import MarketwatcherRunner from "../services/marketwatcherRunner";
import ImporterRunner from "../services/importerRunner";

const validateStart = createValidator(EXWATCHER_START_PARAMS);
const validateStop = createValidator(EXWATCHER_STOP_PARAMS);
const validateUpdate = createValidator(EXWATCHER_UPDATE_PARAMS);

class ExWatcherRunner extends BaseRunner {
  static async create(context, params) {
    try {
      genErrorIfExist(validateStart(params));
      const exWatcherState = await getExWatcherById(
        createWatcherSlug({
          exchange: params.exchange,
          asset: params.asset,
          currency: params.currency
        })
      );
      if (exWatcherState) {
        if (
          exWatcherState.status === STATUS_STARTED ||
          exWatcherState.status === STATUS_STARTING
        ) {
          return {
            taskId: exWatcherState.taskId,
            status: exWatcherState.status
          };
        }
        await deleteExWatcherState(exWatcherState);
      }

      return await ExWatcherRunner.start(context, params);
    } catch (error) {
      const err = new VError(
        {
          name: "ExWatcherRunnerError",
          cause: error,
          info: params
        },
        "Failed to create Exchange Data Watcher"
      );
      Log.error(err);
      throw err;
    }
  }

  static async start(context, params) {
    try {
      let exWatcherState = params;
      if (exWatcherState.status === STATUS_STARTED) {
        return {
          taskId: exWatcherState.taskId,
          status: exWatcherState.status
        };
      }
      const exWatcher = new ExWatcher(context, exWatcherState);
      exWatcher.log(`start`);
      exWatcherState = exWatcher.getCurrentState();

      if (
        exWatcherState.importerHistoryStatus !== STATUS_STARTED &&
        exWatcherState.importerHistoryStatus !== STATUS_FINISHED
      ) {
        exWatcher.log("Importer History!");
        if (exWatcherState.candlebatcherSettings.requiredHistoryMaxBars > 0) {
          const dateFrom = getMaxTimeframeDateFrom(
            exWatcherState.timeframes,
            exWatcherState.candlebatcherSettings.requiredHistoryMaxBars * 2
          );
          // TODO: test startOf("day")
          const dateTo = dayjs
            .utc(`${dayjs.utc().format("YYYY-MM-DD")}T00:00:00.000Z`)
            .toISOString();

          if (dayjs.utc(dateFrom).valueOf() <= dayjs.utc(dateTo).valueOf()) {
            const importerHistoryParams = {
              providerType: exWatcherState.candlebatcherProviderType,
              exchange: exWatcherState.exchange,
              asset: exWatcherState.asset,
              currency: exWatcherState.currency,
              timeframes: exWatcherState.timeframes,
              dateFrom,
              dateTo,
              saveToCache: true,
              proxy: exWatcherState.candlebatcherSettings.proxy
            };

            const result = await ImporterRunner.start(
              context,
              importerHistoryParams
            );
            exWatcher.importerHistoryId = result.taskId;
            exWatcher.importerHistoryStatus = result.status;
            await exWatcher.save();
            exWatcherState = exWatcher.getCurrentState();
          } else {
            exWatcher.importerHistoryStatus = STATUS_FINISHED;
            await exWatcher.save();
            exWatcherState = exWatcher.getCurrentState();
          }
        } else {
          exWatcher.importerHistoryStatus = STATUS_FINISHED;
          await exWatcher.save();
          exWatcherState = exWatcher.getCurrentState();
        }
      }

      if (
        exWatcherState.importerHistoryStatus === STATUS_FINISHED &&
        exWatcherState.marketwatcherStatus !== STATUS_STARTED &&
        exWatcherState.marketwatcherStatus !== STATUS_STARTING
      ) {
        exWatcher.log("Marketwatcher!");
        const marketwatcherParams = {
          exchange: exWatcherState.exchange,
          providerType: exWatcherState.marketwatcherProviderType,
          subscriptions: [
            {
              asset: exWatcherState.asset,
              currency: exWatcherState.currency
            }
          ]
        };

        const result = await MarketwatcherRunner.start(
          context,
          marketwatcherParams
        );
        exWatcher.marketwatcherId = result.taskId;
        exWatcher.marketwatcherStatus = result.status;
        await exWatcher.save();
        exWatcherState = exWatcher.getCurrentState();
      }

      if (
        exWatcherState.marketwatcherStatus === STATUS_STARTED &&
        exWatcherState.candlebatcherStatus !== STATUS_STARTED &&
        exWatcherState.candlebatcherStatus !== STATUS_STARTING
      ) {
        exWatcher.log("Candlebatcher!");
        const candlebatcherParams = {
          providerType: exWatcherState.candlebatcherProviderType,
          exchange: exWatcherState.exchange,
          asset: exWatcherState.asset,
          currency: exWatcherState.currency,
          timeframes: exWatcherState.timeframes,
          settings: exWatcherState.candlebatcherSettings
        };

        const result = await CandlebatcherRunner.start(
          context,
          candlebatcherParams
        );
        exWatcher.candlebatcherId = result.taskId;
        exWatcher.candlebatcherStatus = result.status;
        await exWatcher.save();
        exWatcherState = exWatcher.getCurrentState();
      }
      if (
        exWatcherState.candlebatcherStatus === STATUS_STARTED &&
        exWatcherState.importerCurrentStatus !== STATUS_STARTED &&
        exWatcherState.importerCurrentStatus !== STATUS_FINISHED
      ) {
        exWatcher.log("Importer Current!");
        const importerCurrentParams = {
          providerType: exWatcherState.candlebatcherProviderType,
          exchange: exWatcherState.exchange,
          asset: exWatcherState.asset,
          currency: exWatcherState.currency,
          timeframes: exWatcherState.timeframes,
          // TODO: test startOf("day")
          dateFrom: dayjs
            .utc(`${dayjs.utc().format("YYYY-MM-DD")}T00:00:00.000Z`)
            .toISOString(),
          dateTo: dayjs.utc().toISOString(),
          saveToCache: true,
          proxy: exWatcherState.candlebatcherSettings.proxy
        };

        const result = await ImporterRunner.start(
          context,
          importerCurrentParams
        );
        exWatcher.importerCurrentId = result.taskId;
        exWatcher.importerCurrentStatus = result.status;
        await exWatcher.save();
      }

      return {
        taskId: exWatcher.taskId,
        status: exWatcher.status
      };
    } catch (error) {
      const err = new VError(
        {
          name: "ExWatcherRunnerError",
          cause: error,
          info: params
        },
        "Failed to start Exchange Data Watcher"
      );
      Log.error(err);
      throw err;
    }
  }

  static async stop(context, params) {
    try {
      genErrorIfExist(validateStop(params));
      const exWatcherState = await getExWatcherById(params.taskId);
      if (!exWatcherState) throw new Error("ExWatcherNotFound");
      const exWatcher = new ExWatcher(context, exWatcherState);
      exWatcher.log("stop");
      if (exWatcher.status === STATUS_STOPPED)
        return {
          taskId: exWatcher.taskId,
          status: STATUS_STOPPED
        };

      if (
        exWatcherState.importerHistoryStatus !== STATUS_STOPPED &&
        exWatcherState.importerHistoryStatus !== STATUS_FINISHED
      ) {
        const result = await ImporterRunner.stop(context, {
          taskId: exWatcherState.importerHistoryId
        });
        exWatcher.importerHistoryId = result.taskId;
        exWatcher.importerHistoryStatus = result.status;
      }

      if (
        exWatcherState.importerCurrentStatus !== STATUS_STOPPED &&
        exWatcherState.importerCurrentStatus !== STATUS_FINISHED
      ) {
        const result = await ImporterRunner.stop(context, {
          taskId: exWatcherState.importerCurrentId
        });
        exWatcher.importerCurrentId = result.taskId;
        exWatcher.importerCurrentStatus = result.status;
      }

      if (
        exWatcherState.candlebatcherStatus !== STATUS_STOPPED ||
        exWatcherState.candlebatcherStatus !== STATUS_STOPPING
      ) {
        const result = await CandlebatcherRunner.stop(context, {
          taskId: exWatcherState.candlebatcherId
        });
        exWatcher.candlebatcherId = result.taskId;
        exWatcher.candlebatcherStatus = result.status;
      }

      if (
        exWatcherState.marketwatcherStatus !== STATUS_STOPPED ||
        exWatcherState.marketwatcherStatus !== STATUS_STOPPING
      ) {
        const result = await MarketwatcherRunner.stop(context, {
          taskId: exWatcherState.marketwatcherId
        });
        exWatcher.marketwatcherId = result.taskId;
        exWatcher.marketwatcherStatus = result.status;
      }
      await exWatcher.save();

      return { taskId: exWatcher.taskId, status: exWatcher.status };
    } catch (error) {
      const err = new VError(
        {
          name: "ExWatcherRunnerError",
          cause: error,
          info: params
        },
        "Failed to stop Exchange Data Watcher"
      );
      Log.error(err);
      throw err;
    }
  }

  static async update(context, params) {
    try {
      genErrorIfExist(validateUpdate(params));
      const exWatcherState = await getExWatcherById(params.taskId);
      if (!exWatcherState) throw new Error("ExWatcherNotFound");
      const exWatcher = new ExWatcher(context, exWatcherState);
      exWatcher.log("update");
      if (params.candlebatcherSettings) {
        exWatcher.candlebatcherSettings = params.candlebatcherSettings;
        await CandlebatcherRunner.update(context, {
          taskId: exWatcherState.candlebatcherId,
          settings: params.candlebatcherSettings
        });
      }

      await exWatcher.save();
    } catch (error) {
      const err = new VError(
        {
          name: "ExWathcerRunnerError",
          cause: error,
          info: params
        },
        "Failed to update Exchange Data Watcher"
      );
      Log.error(err);
      throw err;
    }
  }
}

export default ExWatcherRunner;

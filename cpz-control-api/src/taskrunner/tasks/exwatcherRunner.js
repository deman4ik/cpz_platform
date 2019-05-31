import ServiceError from "cpz/error";
import dayjs from "cpz/utils/dayjs";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_FINISHED,
  STATUS_ERROR,
  createWatcherSlug
} from "cpz/config/state";
import {
  getExWatcherById,
  saveExWatcherState,
  deleteExWatcherState
} from "cpz/tableStorage-client/control/exwatchers";
import Log from "cpz/log";
import {
  EXWATCHER_START,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_STOPPED_EVENT,
  TASKS_IMPORTER_FINISHED_EVENT,
  TASKS_MARKETWATCHER_STARTED_EVENT,
  TASKS_MARKETWATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT
} from "cpz/events/types/tasks";
import {
  getMaxTimeframe,
  getMaxTimeframeDateFrom
} from "cpz/utils/candlesUtils";
import ServiceValidator from "cpz/validator";
import {
  ERROR_IMPORTER_ERROR_EVENT,
  ERROR_MARKETWATCHER_ERROR_EVENT,
  ERROR_CANDLEBATCHER_ERROR_EVENT
} from "cpz/events/types/error";
import { getCandlesDB } from "cpz/db-client/candles";
import {
  IMPORTER_IMPORT_CANDLES_MODE,
  IMPORTER_WARMUP_CACHE_MODE
} from "cpz/config/state/types";
import BaseRunner from "../baseRunner";
import ExWatcher from "./exwatcher";
import CandlebatcherRunner from "../services/candlebatcherRunner";
import MarketwatcherRunner from "../services/marketwatcherRunner";
import ImporterRunner from "../services/importerRunner";
import publishEvents from "../../utils/publishEvents";

class ExWatcherRunner extends BaseRunner {
  static async create(params) {
    try {
      ServiceValidator.check(EXWATCHER_START, params);
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

      return await ExWatcherRunner.start(params);
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.EX_WATCHER_RUNNER_ERROR,
          cause: e,
          info: params
        },
        "Failed to create Exchange Data Watcher"
      );
      Log.error(error);
      throw error;
    }
  }

  static async getState(taskId) {
    try {
      const state = await getExWatcherById(taskId);
      if (!state)
        throw new ServiceError(
          {
            name: ServiceError.types.EX_WATCHER_NOT_FOUND_ERROR,
            info: { taskId }
          },
          "Failed to load Exchange Data Watcher state."
        );
      return state;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.EX_WATCHER_RUNNER_ERROR,
          cause: e,
          info: { taskId }
        },
        "Failed to get Exchange Data Watcher state."
      );
      Log.error(error);
      throw error;
    }
  }

  static async handleAction(action) {
    try {
      const { type, taskId, data } = action;
      const state = await ExWatcherRunner.getState(taskId);

      if (type === "event") {
        ExWatcherRunner.handleEvent(state, data);
      } else if (type === "start") {
        ExWatcherRunner.start(state);
      } else if (type === "stop") {
        ExWatcherRunner.stop(state);
      } else if (type === "update") {
        ExWatcherRunner.update(state, data);
      } else {
        Log.error(`Unknown ExWatcher action type - ${type}`);
      }
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.EX_WATCHER_RUNNER_ERROR,
          cause: e,
          info: { action }
        },
        "Failed to handle action with Exchange Data Watcher"
      );
      Log.error(error);
      throw error;
    }
  }

  static async handleEvent(state, event) {
    const exWatcher = new ExWatcher(state);
    try {
      const {
        eventType,
        data: { taskId, error }
      } = event;

      // Importer
      if (eventType === TASKS_IMPORTER_STARTED_EVENT) {
        if (exWatcher.importerHistoryId === taskId) {
          exWatcher.importerHistoryStatus = STATUS_STARTED;
        } else if (exWatcher.importerCurrentId === taskId) {
          exWatcher.importerCurrentStatus = STATUS_STARTED;
        } else if (exWatcher.warmupCacheId === taskId) {
          exWatcher.warmupCacheStatus = STATUS_STARTED;
        }
      } else if (eventType === TASKS_IMPORTER_FINISHED_EVENT) {
        if (exWatcher.importerHistoryId === taskId) {
          exWatcher.importerHistoryStatus = STATUS_FINISHED;
        } else if (exWatcher.importerCurrentId === taskId) {
          exWatcher.importerCurrentStatus = STATUS_FINISHED;
        } else if (exWatcher.warmupCacheId === taskId) {
          exWatcher.warmupCacheStatus = STATUS_FINISHED;
        }
      } else if (eventType === TASKS_IMPORTER_STOPPED_EVENT) {
        if (exWatcher.importerHistoryId === taskId) {
          exWatcher.importerHistoryStatus = STATUS_STOPPED;
        } else if (exWatcher.importerCurrentId === taskId) {
          exWatcher.importerCurrentStatus = STATUS_STOPPED;
        } else if (exWatcher.warmupCacheId === taskId) {
          exWatcher.warmupCacheStatus = STATUS_STOPPED;
        }
      } else if (eventType === ERROR_IMPORTER_ERROR_EVENT) {
        if (exWatcher.importerHistoryId === taskId) {
          exWatcher.importerHistoryStatus = STATUS_ERROR;
          exWatcher.importerHistoryError = error;
        } else if (exWatcher.importerCurrentId === taskId) {
          exWatcher.importerCurrentStatus = STATUS_ERROR;
          exWatcher.importerCurrentError = error;
        } else if (exWatcher.warmupCacheId === taskId) {
          exWatcher.warmupCacheStatus = STATUS_ERROR;
          exWatcher.warmupCacheError = error;
        }
      }

      // Marketwatcher
      else if (eventType === TASKS_MARKETWATCHER_STARTED_EVENT) {
        exWatcher.marketwatcherStatus = STATUS_STARTED;
      } else if (eventType === TASKS_MARKETWATCHER_STOPPED_EVENT) {
        exWatcher.marketwatcherStatus = STATUS_STOPPED;
      } else if (eventType === ERROR_MARKETWATCHER_ERROR_EVENT) {
        exWatcher.marketwatcherError = error;
      }

      // Candlebatcher
      else if (eventType === TASKS_CANDLEBATCHER_STARTED_EVENT) {
        exWatcher.candlebatcherStatus = STATUS_STARTED;
      } else if (eventType === TASKS_CANDLEBATCHER_STOPPED_EVENT) {
        exWatcher.candlebatcherStatus = STATUS_STOPPED;
      } else if (eventType === ERROR_CANDLEBATCHER_ERROR_EVENT) {
        exWatcher.candlebatcherError = error;
      }

      await saveExWatcherState(exWatcher.state);
      await publishEvents(exWatcher.events);

      if (exWatcher.status === STATUS_STARTING) {
        ExWatcherRunner.start(exWatcher.state);
      }
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.EX_WATCHER_RUNNER_ERROR,
          cause: e,
          info: { ...state }
        },
        "Failed to handle service event with Exchange Data Watcher."
      );
      Log.error(error);
      exWatcher.error = error.main;
      await publishEvents(exWatcher.events);
    }
  }

  static async start(state) {
    const exWatcher = new ExWatcher(state);
    try {
      if (state.status === STATUS_STARTED)
        return {
          taskId: state.taskId,
          status: state.status
        };

      exWatcher.status = STATUS_STARTING;

      const events = [];
      if (
        exWatcher.importerHistoryStatus !== STATUS_STARTED &&
        exWatcher.importerHistoryStatus !== STATUS_FINISHED
      ) {
        const maxTimeframe = getMaxTimeframe(exWatcher.timeframes);

        let dateFrom = dayjs
          .utc(
            getMaxTimeframeDateFrom(
              exWatcher.timeframes,
              exWatcher.candlebatcherSettings.requiredHistoryMaxBars
            )
          )
          .startOf("day")
          .toISOString();

        const dateTo = dayjs
          .utc()
          .startOf("minute")
          .toISOString();

        const candles = await getCandlesDB({
          exchange: exWatcher.exchange,
          asset: exWatcher.asset,
          currency: exWatcher.currency,
          timeframe: maxTimeframe,
          dateFrom,
          dateTo
        });

        if (
          candles.length <
          exWatcher.candlebatcherSettings.requiredHistoryMaxBars
        ) {
          if (candles.length > 0) {
            const lastCandle = candles[candles.length - 1];
            dateFrom = lastCandle.timestamp;
          }

          const importerHistoryParams = {
            exchange: exWatcher.exchange,
            asset: exWatcher.asset,
            currency: exWatcher.currency,
            timeframes: exWatcher.timeframes,
            mode: IMPORTER_IMPORT_CANDLES_MODE,
            settings: {
              importCandles: {
                dateFrom: dayjs
                  .utc(dateFrom)
                  .startOf("day")
                  .toISOString(),
                dateTo,
                saveToCache: false,
                proxy: exWatcher.candlebatcherSettings.proxy,
                providerType: exWatcher.candlebatcherProviderType
              }
            }
          };

          const { taskId, status, event } = await ImporterRunner.start(
            importerHistoryParams
          );
          exWatcher.importerHistoryId = taskId;
          exWatcher.importerHistoryStatus = status;
          if (event) events.push(event);
        } else {
          exWatcher.importerHistoryStatus = STATUS_FINISHED;
        }
      }

      if (
        exWatcher.importerHistoryStatus === STATUS_FINISHED &&
        exWatcher.marketwatcherStatus !== STATUS_STARTED &&
        exWatcher.marketwatcherStatus !== STATUS_STARTING
      ) {
        const marketwatcherParams = {
          exchange: exWatcher.exchange,
          providerType: exWatcher.marketwatcherProviderType,
          subscriptions: [
            {
              asset: exWatcher.asset,
              currency: exWatcher.currency
            }
          ]
        };

        const { taskId, status, event } = await MarketwatcherRunner.subscribe(
          marketwatcherParams
        );
        Log.warn(taskId, status, event);
        exWatcher.marketwatcherId = taskId;
        exWatcher.marketwatcherStatus = status;
        if (event) events.push(event);
      }

      if (
        exWatcher.marketwatcherStatus === STATUS_STARTED &&
        exWatcher.candlebatcherStatus !== STATUS_STARTED &&
        exWatcher.candlebatcherStatus !== STATUS_STARTING
      ) {
        const candlebatcherParams = {
          providerType: exWatcher.candlebatcherProviderType,
          exchange: exWatcher.exchange,
          asset: exWatcher.asset,
          currency: exWatcher.currency,
          timeframes: exWatcher.timeframes,
          settings: exWatcher.candlebatcherSettings
        };

        const { taskId, status, event } = await CandlebatcherRunner.start(
          candlebatcherParams
        );
        exWatcher.candlebatcherId = taskId;
        exWatcher.candlebatcherStatus = status;
        if (event) events.push(event);
      }
      if (
        exWatcher.candlebatcherStatus === STATUS_STARTED &&
        exWatcher.importerCurrentStatus !== STATUS_STARTED &&
        exWatcher.importerCurrentStatus !== STATUS_FINISHED
      ) {
        const importerCurrentParams = {
          exchange: exWatcher.exchange,
          asset: exWatcher.asset,
          currency: exWatcher.currency,
          timeframes: exWatcher.timeframes,
          mode: IMPORTER_IMPORT_CANDLES_MODE,
          settings: {
            importCandles: {
              providerType: exWatcher.candlebatcherProviderType,
              dateFrom: dayjs
                .utc()
                .startOf("day")
                .toISOString(),
              dateTo: dayjs.utc().toISOString(),
              saveToCache: false,
              proxy: exWatcher.candlebatcherSettings.proxy
            }
          }
        };

        const { taskId, status, event } = await ImporterRunner.start(
          importerCurrentParams
        );
        exWatcher.importerCurrentId = taskId;
        exWatcher.importerCurrentStatus = status;
        if (event) events.push(event);
      }

      if (
        exWatcher.importerCurrentStatus === STATUS_FINISHED &&
        exWatcher.warmupCacheStatus !== STATUS_STARTED &&
        exWatcher.warmupCacheStatus !== STATUS_FINISHED
      ) {
        const warmupCacheParams = {
          exchange: exWatcher.exchange,
          asset: exWatcher.asset,
          currency: exWatcher.currency,
          timeframes: exWatcher.timeframes,
          mode: IMPORTER_WARMUP_CACHE_MODE,
          settings: {
            warmupCache: {
              barsToCache:
                exWatcher.candlebatcherSettings.requiredHistoryMaxBars
            }
          }
        };
        const { taskId, status, event } = await ImporterRunner.start(
          warmupCacheParams
        );
        exWatcher.warmupCacheId = taskId;
        exWatcher.warmupCacheStatus = status;
        if (event) events.push(event);
      }

      await saveExWatcherState(exWatcher.state);
      await publishEvents([...exWatcher.events, ...events]);
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.EX_WATCHER_RUNNER_ERROR,
          cause: e,
          info: state
        },
        "Failed to start Exchange Data Watcher"
      );
      Log.error(error);
      exWatcher.error = error.main;
      await publishEvents(exWatcher.events);
    }
    return {
      taskId: exWatcher.taskId,
      status: exWatcher.status
    };
  }

  static async stop(state) {
    const exWatcher = new ExWatcher(state);
    try {
      if (state.status === STATUS_STOPPED)
        return {
          taskId: state.taskId,
          status: STATUS_STOPPED
        };

      exWatcher.status = STATUS_STOPPING;

      const events = [];
      if (
        exWatcher.importerHistoryId &&
        exWatcher.importerHistoryStatus !== STATUS_STOPPED &&
        exWatcher.importerHistoryStatus !== STATUS_FINISHED
      ) {
        const { status, event } = await ImporterRunner.stop({
          taskId: exWatcher.importerHistoryId
        });
        exWatcher.importerHistoryStatus = status;
        if (event) events.push(event);
      }

      if (
        exWatcher.importerCurrentId &&
        exWatcher.importerCurrentStatus !== STATUS_STOPPED &&
        exWatcher.importerCurrentStatus !== STATUS_FINISHED
      ) {
        const { status, event } = await ImporterRunner.stop({
          taskId: exWatcher.importerCurrentId
        });
        exWatcher.importerCurrentStatus = status;
        if (event) events.push(event);
      }

      if (
        exWatcher.warmupCachetId &&
        exWatcher.warmupCacheStatus !== STATUS_STOPPED &&
        exWatcher.warmupCacheStatus !== STATUS_FINISHED
      ) {
        const { status, event } = await ImporterRunner.stop({
          taskId: exWatcher.warmupCacheId
        });
        exWatcher.warmupCacheStatus = status;
        if (event) events.push(event);
      }

      if (
        exWatcher.candlebatcherId &&
        (exWatcher.candlebatcherStatus !== STATUS_STOPPED ||
          exWatcher.candlebatcherStatus !== STATUS_STOPPING)
      ) {
        const { status, event } = await CandlebatcherRunner.stop({
          taskId: exWatcher.candlebatcherId
        });

        exWatcher.candlebatcherStatus = status;
        if (event) events.push(event);
      }

      if (
        exWatcher.marketwatcherId &&
        (exWatcher.marketwatcherStatus !== STATUS_STOPPED ||
          exWatcher.marketwatcherStatus !== STATUS_STOPPING)
      ) {
        const marketwatcherParams = {
          taskId: exWatcher.marketwatcherId,
          exchange: exWatcher.exchange,
          subscriptions: [
            {
              asset: exWatcher.asset,
              currency: exWatcher.currency
            }
          ]
        };
        const { status, event } = await MarketwatcherRunner.unsubscribe(
          marketwatcherParams
        );

        exWatcher.marketwatcherStatus = status;
        if (event) events.push(event);
      }
      await saveExWatcherState(exWatcher.state);
      await publishEvents([...exWatcher.events, ...events]);
    } catch (error) {
      const err = new ServiceError(
        {
          name: ServiceError.types.EX_WATCHER_RUNNER_ERROR,
          cause: error,
          info: state
        },
        "Failed to stop Exchange Data Watcher"
      );
      Log.error(err);
      exWatcher.error = error.main;
      await publishEvents(exWatcher.events);
    }
    return { taskId: exWatcher.taskId, status: exWatcher.status };
  }
}

export default ExWatcherRunner;

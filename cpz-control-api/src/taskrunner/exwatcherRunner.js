import VError from "verror";
import dayjs from "cpzDayjs";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_FINISHED,
  createCachedCandleSlug,
  createExWatcherTaskSubject
} from "cpzState";
import {
  getExWatcherById,
  saveCandlesArrayToCache,
  countCachedCandles
} from "cpzStorage";
import { CONTROL_SERVICE } from "cpzServices";
import publishEvents from "cpzEvents";
import {
  TASKS_TOPIC,
  EXWATCHER_START_PARAMS,
  EXWATCHER_STOP_PARAMS,
  EXWATCHER_UPDATE_PARAMS,
  TASKS_EXWATCHER_STARTED_EVENT
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import {
  generateCandleRowKey,
  timeframeToTimeUnit
} from "cpzUtils/candlesUtils";
import { durationMinutes } from "cpzUtils/helpers";
import { getCandlesDB } from "cpzDB";
import BaseRunner from "./baseRunner";
import ExWatcher from "./exwatcher";
import CandlebatcherRunner from "./services/candlebatcherRunner";
import MarketwatcherRunner from "./services/marketwatcherRunner";
import ImporterRunner from "./services/importerRunner";

const validateStart = createValidator(EXWATCHER_START_PARAMS);
const validateStop = createValidator(EXWATCHER_STOP_PARAMS);
const validateUpdate = createValidator(EXWATCHER_UPDATE_PARAMS);

class ExWatcherRunner extends BaseRunner {
  static async loadHistoryToCache({
    exchange,
    asset,
    currency,
    timeframes,
    candlebatcherParams
  }) {
    try {
      const result = { importRequired: false, timeframes: {} };
      await Promise.all(
        timeframes.map(async timeframe => {
          try {
            const { number, unit } = timeframeToTimeUnit(
              candlebatcherParams.requiredHistoryMaxBars,
              timeframe
            );
            const dateFrom = `${dayjs()
              .utc()
              .add(-number, unit)
              .format("YYYY-MM-DD")}T00:00:00.000Z`;
            const dateTo = `${dayjs()
              .utc()
              .format("YYYY-MM-DD")}T00:00:00.000Z`;
            const cachedCandlesCount = await countCachedCandles({
              slug: createCachedCandleSlug({
                exchange,
                asset,
                currency,
                timeframe
              }),
              dateFrom,
              dateTo
            });
            const warmCandlesCount = durationMinutes(dateFrom, dateTo);
            if (cachedCandlesCount < warmCandlesCount) {
              const candles = await getCandlesDB({
                exchange,
                asset,
                currency,
                timeframe,
                dateTo,
                limit: candlebatcherParams.requiredHistoryMaxBars,
                orderBy: "{ timestamp: desc }"
              });
              if (
                candles.length >= candlebatcherParams.requiredHistoryMaxBars
              ) {
                const candlesToSave = candles.reverse().map(candle => ({
                  ...candle,
                  PartitionKey: createCachedCandleSlug({
                    exchange: candle.exchange,
                    asset: candle.asset,
                    currency: candle.currency,
                    timeframe: candle.timeframe
                  }),
                  RowKey: generateCandleRowKey(candle.time)
                }));

                await saveCandlesArrayToCache(candlesToSave);
              } else {
                result.importRequired = true;
                result.timeframes[timeframe] = {
                  dateFrom,
                  dateTo
                };
              }
            }
          } catch (error) {
            throw new VError(
              {
                name: "CandlebatcherError",
                cause: error,
                info: {
                  taskId: this._taskId,
                  eventSubject: this._eventSubject,
                  timeframe
                }
              },
              `Failed to process timeframe "%s"`,
              timeframe
            );
          }
        })
      );

      return result;
    } catch (error) {
      throw new VError(
        {
          name: "LoadHistoryToCache",
          cause: error
        },
        `Failed to load history candles to cache`
      );
    }
  }

  static async start(params) {
    try {
      genErrorIfExist(validateStart(params));
      let exWatcherState = params;
      const exWatcher = new ExWatcher(exWatcherState);
      if (exWatcher.status === STATUS_STARTED) {
        return {
          taskId: exWatcher.taskId,
          status: STATUS_STARTED
        };
      }
      exWatcherState = exWatcher.getCurrentState();

      if (
        exWatcherState.importerHistoryStatus !== STATUS_STARTED &&
        exWatcherState.importerHistoryStatus !== STATUS_FINISHED
      ) {
        const historyStatus = await this.loadHistoryToCache(exWatcherState);
        if (historyStatus.importRequired) {
          const maxTimeframe = Math.max(
            Object.keys(historyStatus.timeframes).map(key => parseInt(key, 10))
          );
          const { dateFrom, dateTo } = historyStatus.timeframes[maxTimeframe];
          const importerHistoryParams = {
            providerType: exWatcherState.candlebatcherProviderType,
            exchange: exWatcherState.exchange,
            asset: exWatcherState.asset,
            currency: exWatcherState.currency,
            timeframes: exWatcherState.timeframes,
            dateFrom,
            dateTo,
            saveToCache: true,
            proxy: exWatcherState.candlebatcherParams.proxy
          };

          const result = await ImporterRunner.start(importerHistoryParams);
          exWatcher.importerHistoryId = result.taskId;
          exWatcher.importerHistoryStatus = result.status;
          await exWatcher.save();
          exWatcherState = exWatcher.getCurrentState();
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
        const marketwatcherParams = {
          exchange: exWatcherState.exchange,
          providerType: exWatcherState.marketwatcherProviderType,
          subsriptions: [
            {
              asset: exWatcherState.asset,
              currency: exWatcherState.currency
            }
          ]
        };

        const result = await MarketwatcherRunner.start(marketwatcherParams);
        exWatcher.marketwatcherId = result.taskId;
        exWatcher.marketwatcherStatus = result.status;
        await exWatcher.save();
        exWatcherState = exWatcher.getCurrentState();
      }

      if (
        exWatcherState.importerHistoryStatus === STATUS_FINISHED &&
        exWatcherState.marketwatcherStatus === STATUS_STARTED &&
        (exWatcherState.candlebatcherStatus !== STATUS_STARTED &&
          exWatcherState.candlebatcherStatus !== STATUS_STARTING)
      ) {
        const candlebatcherParams = {
          providerType: exWatcherState.candlebatcherProviderType,
          exchange: exWatcherState.exchange,
          asset: exWatcherState.asset,
          currency: exWatcherState.currency,
          timeframes: exWatcherState.timeframes,
          settings: exWatcherState.candlebatcherSettings
        };

        const result = await CandlebatcherRunner.start(candlebatcherParams);
        exWatcher.candlebatcherId = result.taskId;
        exWatcher.candlebatcherStatus = result.status;
        await exWatcher.save();
        exWatcherState = exWatcher.getCurrentState();
      }

      if (
        exWatcherState.importerHistoryStatus === STATUS_FINISHED &&
        exWatcherState.marketwatcherStatus === STATUS_STARTED &&
        exWatcherState.candlebatcherStatus === STATUS_STARTED &&
        (exWatcherState.importerCurrentStatus !== STATUS_STARTED &&
          exWatcherState.importerCurrentStatus !== STATUS_FINISHED)
      ) {
        const importerCurrentParams = {
          providerType: exWatcherState.candlebatcherProviderType,
          exchange: exWatcherState.exchange,
          asset: exWatcherState.asset,
          currency: exWatcherState.currency,
          timeframes: exWatcherState.timeframes,
          dateFrom: `${dayjs()
            .utc()
            .format("YYYY-MM-DD")}T00:00:00.000Z`,
          dateTo: dayjs()
            .utc()
            .startOf("minute")
            .toISOString(),
          saveToCache: true,
          proxy: exWatcherState.candlebatcherParams.proxy
        };

        const result = await ImporterRunner.start(importerCurrentParams);
        exWatcher.importerCurrentId = result.taskId;
        exWatcher.importerCurrentStatus = result.status;
        await exWatcher.save();
      }

      if (exWatcher.status === STATUS_STARTED) {
        await publishEvents(TASKS_TOPIC, {
          service: CONTROL_SERVICE,
          subject: createExWatcherTaskSubject({
            exchange: exWatcherState.exchange,
            asset: exWatcherState.asset,
            currency: exWatcherState.currency
          }),
          eventType: TASKS_EXWATCHER_STARTED_EVENT,
          data: {
            taskId: exWatcherState.taskId
          }
        });
      }
      return {
        taskId: exWatcher.taskId,
        status: exWatcher.status
      };
    } catch (error) {
      throw new VError(
        {
          name: "ExWatcherRunnerError",
          cause: error,
          info: params
        },
        "Failed to start Exchange Data Watcher"
      );
    }
  }

  static async stop(params) {
    try {
      genErrorIfExist(validateStop(params));
      const exWatcherState = getExWatcherById(params.taskId);
      if (!exWatcherState) throw new Error("ExWatcherNotFound");
      const exWatcher = new ExWatcher(exWatcherState);
      if (exWatcher.status === STATUS_STOPPED)
        return {
          taskId: exWatcher.taskId,
          status: STATUS_STOPPED
        };

      if (
        exWatcherState.importerHistoryStatus !== STATUS_STOPPED &&
        exWatcherState.importerHistoryStatus !== STATUS_FINISHED
      ) {
        const result = await ImporterRunner.stop({
          taskId: exWatcherState.importerHistoryId
        });
        exWatcher.importerHistoryId = result.taskId;
        exWatcher.importerHistoryStatus = result.status;
      }

      if (
        exWatcherState.importerCurrentStatus !== STATUS_STOPPED &&
        exWatcherState.importerCurrentStatus !== STATUS_FINISHED
      ) {
        const result = await ImporterRunner.stop({
          taskId: exWatcherState.importerCurrentId
        });
        exWatcher.importerCurrentId = result.taskId;
        exWatcher.importerCurrentStatus = result.status;
      }

      if (
        exWatcherState.candlebatcherStatus !== STATUS_STOPPED ||
        exWatcherState.candlebatcherStatus !== STATUS_STOPPING
      ) {
        const result = await CandlebatcherRunner.stop({
          taskId: exWatcherState.candlebatcherId,
          exWatcherId: exWatcher.taskId
        });
        exWatcher.candlebatcherId = result.taskId;
        exWatcher.candlebatcherStatus = result.status;
      }

      if (
        exWatcherState.marketwatcherStatus !== STATUS_STOPPED ||
        exWatcherState.marketwatcherStatus !== STATUS_STOPPING
      ) {
        const result = await MarketwatcherRunner.stop({
          taskId: exWatcherState.marketwatcherId,
          exWatcherId: exWatcher.taskId
        });
        exWatcher.marketwatcherId = result.taskId;
        exWatcher.marketwatcherStatus = result.status;
      }
      await exWatcher.save();

      return { taskId: exWatcher.taskId, status: exWatcher.status };
    } catch (error) {
      throw new VError(
        {
          name: "ExWatcherRunnerError",
          cause: error,
          info: params
        },
        "Failed to stop Exchange Data Watcher"
      );
    }
  }

  static async update(params) {
    try {
      genErrorIfExist(validateUpdate(params));
      const exWatcherState = getExWatcherById(params.taskId);
      if (!exWatcherState) throw new Error("ExWatcherNotFound");
      const exWatcher = new ExWatcher(exWatcherState);

      if (params.candlebatcherSettings) {
        exWatcher.candlebatcherSettings = params.candlebatcherSettings;
        await CandlebatcherRunner.update({
          taskId: exWatcherState.candlebatcherId,
          settings: params.candlebatcherSettings
        });
      }

      await exWatcher.save();
    } catch (error) {
      throw new VError(
        {
          name: "ExWathcerRunnerError",
          cause: error,
          info: params
        },
        "Failed to update Exchange Data Watcher"
      );
    }
  }
}

export default ExWatcherRunner;

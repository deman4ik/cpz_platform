import dayjs from "cpz/utils/dayjs";
import ServiceError from "cpz/error";
import { json2csvAsync } from "json-2-csv";
import {
  BACKTEST_MODE,
  createBacktesterSlug,
  STATUS_ERROR,
  STATUS_FINISHED,
  STATUS_STARTED
} from "cpz/config/state";
import EventGrid from "cpz/events";
import BlobStorageClient from "cpz/blobStorage";
import Log from "cpz/log";
import {
  combineAdviserSettings,
  combineBacktesterSettings,
  combineTraderSettings
} from "cpz/utils/settings";
import {
  chunkNumberToArray,
  generateInvertedKey,
  sortAsc
} from "cpz/utils/helpers";
import {
  deleteBacktesterState,
  getBacktesterById,
  saveBacktesterState,
  saveBacktesterStratLogs,
  saveBacktesterItems,
  saveBacktesterSignals,
  saveBacktesterOrders,
  saveBacktesterPositions,
  saveBacktesterErrors
} from "cpz/tableStorage-client/backtest/backtesters";
import {
  deleteBacktestDB,
  isBacktestExistsDB,
  saveBacktestDB
} from "cpz/db-client/backtests";
import { countCandlesDB, getCandlesDB } from "cpz/db-client/candles";
import { saveSignalsDB } from "cpz/db-client/signals";
import { saveOrdersDB } from "cpz/db-client/orders";
import { savePositionsDB } from "cpz/db-client/positions";
import {
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_FINISHED_EVENT
} from "cpz/events/types/tasks/backtester";
import { ERROR_BACKTESTER_ERROR_EVENT } from "cpz/events/types/error";
import { BACKTESTER_LOGS } from "cpz/blobStorage/containers";
import AdviserBacktester from "./adviser";
import TraderBacktester from "./trader";

class Backtester {
  constructor(state) {
    this._initialState = state;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._taskId = state.taskId;
    this._robotId = state.robotId;
    this._dateFrom = state.dateFrom;
    this._dateTo = state.dateTo;
    this._settings = combineBacktesterSettings(state.settings);
    this._adviserSettings = combineAdviserSettings(state.adviserSettings);
    this._traderSettings = combineTraderSettings(state.traderSettings);
    this._requiredHistoryCache = this._adviserSettings.requiredHistoryCache;
    this._requiredHistoryMaxBars = this._adviserSettings.requiredHistoryMaxBars;
    this._totalBars = 0;
    this._processedBars = 0;
    this._leftBars = 0;
    this._percent = 0;
    this._oldPercent = 0;
    this._startedAt = null;
    this._endedAt = null;
    this._status = STATUS_STARTED;
    this._slug = createBacktesterSlug({
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      robotId: this._robotId
    });
    this._adviserBacktester = new AdviserBacktester({
      ...state,
      settings: this._adviserSettings
    });
    this._traderBacktester = new TraderBacktester({
      ...state,
      settings: { ...this._traderSettings, mode: BACKTEST_MODE }
    });
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Adviser
   */
  log(...args) {
    if (this._settings.debug) {
      Log.debug(`Backtester ${this._taskId}:`, ...args);
    }
  }

  logInfo(...args) {
    Log.info(`Backtester ${this._taskId}:`, ...args);
  }

  logError(...args) {
    Log.error(`Backtester ${this._taskId}:`, ...args);
  }

  get state() {
    return {
      ...this._initialState,
      PartitionKey: this._slug,
      RowKey: this._taskId,
      settings: this._settings,
      totalBars: this._totalBars,
      processedBars: this._processedBars,
      leftBars: this._leftBars,
      percent: this._percent,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      status: this._status
    };
  }

  async save() {
    try {
      // Сохраняем состояние в локальном хранилище
      if (this._settings.saveToStorage) await saveBacktesterState(this.state);
      if (this._settings.saveToDB) await saveBacktestDB(this.state);
    } catch (error) {
      throw new ServiceError(
        {
          name: ServiceError.types.BACKTESTER_ERROR,
          cause: error,
          info: {
            taskId: this._taskId
          }
        },
        'Failed to save backtester "%s" state',
        this._taskId
      );
    }
  }

  async execute() {
    try {
      this._startedAt = dayjs.utc().toISOString();
      const backtester = await getBacktesterById(this._taskId);
      if (backtester) {
        this.log(
          `Previous backtest state with taskId ${
            this._taskId
          } found. Deleting...`
        );
        await deleteBacktesterState({
          RowKey: this._taskId,
          PartitionKey: this._slug
        });
      }
      const backtesterExistsDB = await isBacktestExistsDB(this._taskId);
      if (backtesterExistsDB) {
        this.log(
          `Previous backtest state with id ${
            this._taskId
          } found in DB. Deleting...`
        );
        await deleteBacktestDB(this._taskId);
      }

      await this._adviserBacktester.bInit(this._settings.local);
      let candlesToCSV = [];
      this.log(`Starting ${this._taskId}...`);

      // Если необходим прогрев
      if (this._requiredHistoryCache && this._requiredHistoryMaxBars) {
        this.log("Warming cache...");
        // Формируем параметры запроса
        const requiredHistoryRequest = {
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: this._timeframe,
          dateFrom: dayjs
            .utc(this._dateFrom)
            .add(
              (-this._requiredHistoryMaxBars * 2) / this._timeframe,
              "minute"
            )
            .toISOString(),
          dateTo: dayjs
            .utc(this._dateFrom)
            .add(-1, "minute")
            .toISOString()
        };

        // Запрашиваем свечи из БД
        const getRequiredHistoryResult = await getCandlesDB(
          requiredHistoryRequest
        );

        // Сортируем загруженные свечи в порядке возрастания и отсекаем лишнее
        const requiredHistoryCandles = getRequiredHistoryResult
          .sort((a, b) => sortAsc(a.time, b.time))
          .slice(-this._requiredHistoryMaxBars);
        // Если загрузили меньше свечей чем запросили
        if (requiredHistoryCandles.length < this._requiredHistoryMaxBars) {
          // Генерируем ошибку
          throw new ServiceError(
            {
              name: ServiceError.types.BACKTEST_HISTORY_RANGE_ERROR,
              info: {
                requiredHistoryMaxBars: this._requiredHistoryMaxBars,
                actualHistoryMaxBars: requiredHistoryCandles.length
              }
            },
            "Can't load history required: %s bars but loaded: %s bars",
            this._requiredHistoryMaxBars,
            requiredHistoryCandles.length
          );
        }

        this._adviserBacktester.bSetCachedCandles(requiredHistoryCandles);
        if (this._settings.saveCandlesCSV) {
          candlesToCSV = [
            ...new Set([...candlesToCSV, ...requiredHistoryCandles])
          ];
        }
      }
      // Сохраняем начальное состояние
      await this.save();
      await EventGrid.publish(TASKS_BACKTESTER_STARTED_EVENT, {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      });

      this._totalBars = await countCandlesDB({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        dateFrom: this._dateFrom,
        dateTo: this._dateTo
      });

      this._iterations = chunkNumberToArray(this._totalBars, 1000000);
      this._prevIteration = 0;
      let logsToSaveCSV = [];
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const iteration of this._iterations) {
        const logsToSave = [];
        const traceToSave = [];
        const signalsToSave = [];
        const signalsToSaveDB = [];
        const ordersToSave = [];
        const ordersToSaveDB = {};
        const positionsToSave = [];
        const positionsToSaveDB = {};
        const errorsToSave = [];
        Log.debug("Loading", iteration, "candles from DB...");
        const historyCandles = await getCandlesDB({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: this._timeframe,
          dateFrom: this._dateFrom,
          dateTo: this._dateTo,
          limit: iteration,
          offset: this._prevIteration
        });
        Log.debug(
          "Processing iteration from:",
          historyCandles[0].timestamp,
          "to:",
          historyCandles[historyCandles.length - 1].timestamp
        );
        this._prevIteration += iteration;

        if (this._settings.saveCandlesCSV) {
          candlesToCSV = [...new Set([...candlesToCSV, ...historyCandles])];
        }

        for (const candle of historyCandles) {
          let signals = [];
          await this._adviserBacktester.bRunActions(candle);
          signals = this._adviserBacktester.bSignalsEvents;
          this._traderBacktester.bHandleCandle(candle);
          this._traderBacktester.bExecuteOrders();
          for (const signal of this._adviserBacktester.bSignalsEvents) {
            this._traderBacktester.handleSignal(signal);
            this._traderBacktester.bExecuteOrders();
          }
          await this._adviserBacktester.bRunStrategy(candle);
          signals = [...signals, ...this._adviserBacktester.bSignalsEvents];
          for (const signal of this._adviserBacktester.bSignalsEvents) {
            this._traderBacktester.handleSignal(signal);
            this._traderBacktester.bExecuteOrders();
          }

          if (this._settings.trace) {
            traceToSave.push({
              PartitionKey: this._taskId,
              RowKey: generateInvertedKey(),
              candleId: candle.id,
              candleTimestamp: candle.timestamp,
              candleTime: candle.time,
              candleHigh: candle.high,
              candleOpen: candle.open,
              candleClose: candle.close,
              candleLow: candle.low,
              ...this._adviserBacktester.bIndicatorsResults
            });
          }

          if (signals.length > 0) {
            this.log(`${signals.length} signals to send`);
            signals.forEach(signalEvent => {
              if (this._settings.saveToDB)
                signalsToSaveDB.push({
                  ...signalEvent,
                  backtesterId: this._taskId
                });
              if (this._settings.saveToStorage)
                signalsToSave.push({
                  RowKey: generateInvertedKey(),
                  PartitionKey: this._taskId,
                  ...signalEvent,
                  backtesterId: this._taskId
                });
            });
          }

          if (
            this._settings.debug &&
            this._adviserBacktester.bLogEvents.length > 0
          ) {
            this.log(
              `${this._adviserBacktester.bLogEvents.length} logs to send`
            );
            this._adviserBacktester.bLogEvents.forEach(logEvent => {
              logsToSave.push({
                ...logEvent,
                backtesterId: this._taskId,
                backtesterCandleId: candle.id,
                backtesterCandleTimestamp: candle.timestamp,
                backtesterCandleTime: candle.time,
                backtesterCandleHigh: candle.high,
                backtesterCandleOpen: candle.open,
                backtesterCandleClose: candle.close,
                backtesterCandleLow: candle.low,
                RowKey: generateInvertedKey(),
                PartitionKey: this._taskId
              });
            });
          }

          if (this._traderBacktester.bErrorEvents.length > 0) {
            this._traderBacktester.bErrorEvents.forEach(errorEvent => {
              errorsToSave.push({
                ...errorEvent,
                PartitionKey: this._taskId,
                RowKey: generateInvertedKey(),
                backtesterCandleId: candle.id,
                backtesterCandleTimestamp: candle.timestamp
              });
            });
          }
          if (Object.keys(this._traderBacktester.bPositionEvents).length > 0) {
            this.log(
              `${
                Object.keys(this._traderBacktester.bPositionEvents).length
              } positions to send`
            );
            Object.keys(this._traderBacktester.bPositionEvents).forEach(key => {
              const positionEvent = this._traderBacktester.bPositionEvents[key];

              if (this._settings.saveToDB) {
                if (!positionsToSaveDB[key]) {
                  positionsToSaveDB[key] = {
                    ...positionEvent,
                    backtesterId: this._taskId,
                    entry: {
                      ...positionEvent.entry,
                      date: candle.timestamp
                    }
                  };
                } else {
                  positionsToSaveDB[key] = {
                    ...positionsToSaveDB[key],
                    ...positionEvent
                  };
                }
              }

              if (this._settings.saveToStorage) {
                positionsToSave.push({
                  ...positionEvent,
                  backtesterId: this._taskId,
                  backtesterCandleId: candle.id,
                  backtesterCandleTimestamp: candle.timestamp,

                  RowKey: generateInvertedKey(),
                  PartitionKey: this._taskId
                });
              }
            });
          }

          if (Object.keys(this._traderBacktester.bOrderEvents).length > 0) {
            Object.keys(this._traderBacktester.bOrderEvents).forEach(key => {
              const orderEvent = this._traderBacktester.bOrderEvents[key];

              if (this._settings.saveToDB) {
                if (!ordersToSaveDB[key]) {
                  ordersToSaveDB[key] = {
                    ...orderEvent,
                    backtesterId: this._taskId,
                    candleTimestamp: candle.timestamp
                  };
                } else {
                  ordersToSaveDB[key] = {
                    ...ordersToSaveDB[key],
                    ...orderEvent
                  };
                }
              }

              if (this._settings.saveToStorage) {
                ordersToSave.push({
                  ...orderEvent,
                  backtesterId: this._taskId,
                  backtesterCandleId: candle.id,
                  backtesterCandleTimestamp: candle.timestamp,
                  RowKey: generateInvertedKey(),
                  PartitionKey: this._taskId
                });
              }
            });
          }

          this._adviserBacktester.bClearEvents();
          this._traderBacktester.bClearEvents();
          this._traderBacktester.bClearPositions();

          // Обновляем статистику

          this._processedBars += 1;
          this._leftBars = this._totalBars - this._processedBars;
          this._percent = Math.round(
            (this._processedBars / this._totalBars) * 100
          );

          if (this._percent > this._oldPercent) {
            this.log(
              "processedBars: ",
              this._processedBars,
              "leftBars: ",
              this._leftBars,
              `${this._percent} %`
            );

            this._oldPercent = this._percent;
          }
        }

        logsToSaveCSV = [...logsToSaveCSV, ...logsToSave];
        if (this._settings.saveToStorage) {
          if (logsToSave.length > 0) await saveBacktesterStratLogs(logsToSave);
          if (traceToSave.length > 0) await saveBacktesterItems(traceToSave);
          if (signalsToSave.length > 0)
            await saveBacktesterSignals(signalsToSave);
          if (ordersToSave.length > 0) await saveBacktesterOrders(ordersToSave);
          if (positionsToSave.length > 0)
            await saveBacktesterPositions(positionsToSave);
        }
        if (this._settings.saveToDB) {
          if (signalsToSaveDB.length > 0) await saveSignalsDB(signalsToSaveDB);
          if (Object.keys(positionsToSaveDB).length > 0)
            await savePositionsDB(Object.values(positionsToSaveDB));
          if (Object.keys(ordersToSaveDB).length > 0)
            await saveOrdersDB(Object.values(ordersToSaveDB));
        }
        if (errorsToSave.length > 0) await saveBacktesterErrors(errorsToSave);
        // Сохраняем состояние пачки
        await this.save();
      }
      /* no-restricted-syntax, no-await-in-loop  */

      this.log("Saving log events to csv");
      const logsCSV = await json2csvAsync(logsToSaveCSV);
      await BlobStorageClient.upload(
        BACKTESTER_LOGS,
        `${this._taskId}_logEvents.csv`,
        logsCSV
      );

      if (this._settings.saveCandlesCSV) {
        this.log("Saving candles to csv");
        const candlesToSave = candlesToCSV.map(candle => ({
          date: dayjs.utc(candle.timestamp).format("DD.MM.YYYY"),
          time: dayjs.utc(candle.timestamp).format("HH:mm:ss"),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume
        }));
        const candlesCSV = await json2csvAsync(candlesToSave);
        await BlobStorageClient.upload(
          BACKTESTER_LOGS,
          `${this._taskId}_candles.csv`,
          candlesCSV
        );
      }
      // Закончили обработку
      this._status = STATUS_FINISHED;
      this._endedAt = dayjs.utc().toISOString();
      // Сохраняем состояние пачки
      await this.save();

      const duration = dayjs
        .utc(this._endedAt)
        .diff(dayjs.utc(this._startedAt), "minute");
      await EventGrid.publish(TASKS_BACKTESTER_FINISHED_EVENT, {
        subject: this._taskId,
        data: {
          taskId: this._taskId
        }
      });

      this.log(
        `Backtest finished! From`,
        dayjs.utc(this._dateFrom).toISOString(),
        "to",
        dayjs.utc(this._dateTo).toISOString(),
        "in",
        duration,
        "minutes"
      );
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.BACKTESTER_ERROR,
          cause: e,
          info: {
            taskId: this._taskId,
            critical: true
          }
        },
        'Failed to execute backtest taskId: "%s"',
        this._taskId
      );

      Log.error(error);
      // Если есть экземпляр класса
      this._status = STATUS_ERROR;
      this._error = error.json;
      await this.save();
      // Публикуем событие - ошибка
      await EventGrid.publish(ERROR_BACKTESTER_ERROR_EVENT, {
        subject: this._taskId,
        data: {
          error: error.main
        }
      });
    }
  }
}

export default Backtester;

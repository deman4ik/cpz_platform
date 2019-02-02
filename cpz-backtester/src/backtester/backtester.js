import dayjs from "cpzDayjs";
import VError from "verror";
import {
  STATUS_STARTED,
  STATUS_FINISHED,
  STATUS_ERROR,
  createBacktesterSlug,
  BACKTEST_MODE
} from "cpzState";
import publishEvents from "cpzEvents";
import { BACKTESTER_SERVICE } from "cpzServices";
import {
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_FINISHED_EVENT,
  ERROR_BACKTESTER_EVENT,
  LOG_BACKTESTER_EVENT,
  TRADES_POSITION_EVENT,
  TRADES_ORDER_EVENT,
  ERROR_TOPIC,
  TASKS_TOPIC,
  LOG_TOPIC
} from "cpzEventTypes";
import {
  BACKTESTER_SETTINGS_DEFAULTS,
  ADVISER_SETTINGS_DEFAULTS
} from "cpzDefaults";
import { sortAsc, generateKey, chunkNumberToArray } from "cpzUtils/helpers";
import { createErrorOutput } from "cpzUtils/error";
import {
  getBacktesterById,
  saveBacktesterState,
  saveBacktesterStratLogs,
  deleteBacktesterState
} from "cpzStorage/backtesters";
import {
  saveBacktestsDB,
  isBacktestExistsDB,
  deleteBacktestDB,
  countCandlesDB,
  getCandlesDB,
  saveSignalsDB,
  savePositionsDB,
  saveOrdersDB
} from "cpzDB";
import AdviserBacktester from "./adviser";
import TraderBacktester from "./trader";

class Backtester {
  constructor(state) {
    this.initialState = state;
    this.eventSubject = state.eventSubject;
    this.exchange = state.exchange;
    this.asset = state.asset;
    this.currency = state.currency;
    this.timeframe = state.timeframe;
    this.taskId = state.taskId;
    this.robotId = state.robotId;
    this.dateFrom = state.dateFrom;
    this.dateTo = state.dateTo;
    this.settings = {
      debug:
        state.settings.debug === undefined || state.settings.debug === null
          ? BACKTESTER_SETTINGS_DEFAULTS.debug
          : state.settings.debug
    };
    this.adviserSettings = state.adviserSettings;
    this.traderSettings = state.traderSettings;
    this.requiredHistoryCache =
      state.adviserSettings.requiredHistoryCache === undefined ||
      state.adviserSettings.requiredHistoryCache === null
        ? ADVISER_SETTINGS_DEFAULTS.requiredHistoryCache
        : state.adviserSettings.requiredHistoryCache;
    this.requiredHistoryMaxBars =
      state.adviserSettings.requiredHistoryMaxBars ||
      ADVISER_SETTINGS_DEFAULTS.requiredHistoryMaxBars;
    this.totalBars = 0;
    this.processedBars = 0;
    this.leftBars = 0;
    this.percent = 0;
    this.oldPercent = 0;
    this.startedAt = null;
    this.endedAt = null;
    this.status = STATUS_STARTED;
    this.slug = createBacktesterSlug({
      exchange: this.exchange,
      asset: this.asset,
      currency: this.currency,
      timeframe: this.timeframe,
      robotId: this.robotId
    });
    this.adviserBacktester = new AdviserBacktester(
      {},
      {
        ...state,
        settings: this.adviserSettings
      }
    );
    this.traderBacktester = new TraderBacktester(
      {},
      {
        ...state,
        settings: { ...this.traderSettings, mode: BACKTEST_MODE }
      }
    );
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Adviser
   */
  log(...args) {
    if (this.settings.debug) {
      const logData = args.map(arg => JSON.stringify(arg));
      process.send([`Backtester ${this.eventSubject}:`, ...logData]);
    }
  }

  /**
   * Логирование в EventGrid в топик CPZ-LOGS
   *
   * @param {*} data
   * @memberof Adviser
   */
  logEvent(data) {
    // Публикуем событие
    publishEvents(LOG_TOPIC, {
      service: BACKTESTER_SERVICE,
      subject: this.eventSubject,
      eventType: LOG_BACKTESTER_EVENT,
      data: {
        taskId: this.taskId,
        ...data
      }
    });
  }

  getCurrentState() {
    return {
      ...this.initialState,
      PartitionKey: this.slug,
      RowKey: this.taskId,
      settings: this.settings,
      totalBars: this.totalBars,
      processedBars: this.processedBars,
      leftBars: this.leftBars,
      percent: this.percent,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      status: this.status
    };
  }

  async save() {
    try {
      // Сохраняем состояние в локальном хранилище
      await saveBacktesterState(this.getCurrentState());
      await saveBacktestsDB(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "BacktesterError",
          cause: error,
          info: {
            taskId: this.taskId
          }
        },
        'Failed to save backtester "%s" state',
        this.taskId
      );
    }
  }

  async execute() {
    try {
      this.startedAt = dayjs().toISOString();
      const backtester = await getBacktesterById(this.taskId);
      if (backtester) {
        this.log(
          `Previous backtest state with taskId ${
            this.taskId
          } found. Deleting...`
        );
        await deleteBacktesterState({
          RowKey: this.taskId,
          PartitionKey: this.slug
        });
      }
      const backtesterExistsDB = await isBacktestExistsDB(this.taskId);
      if (backtesterExistsDB) {
        this.log(
          `Previous backtest state with id ${
            this.taskId
          } found in DB. Deleting...`
        );
        await deleteBacktestDB(this.taskId);
      }

      this.log(`Starting ${this.taskId}...`);

      // Если необходим прогрев
      if (this.requiredHistoryCache && this.requiredHistoryMaxBars) {
        this.log("Warming cache...");
        // Формируем параметры запроса
        const requiredHistoryRequest = {
          exchange: this.exchange,
          asset: this.asset,
          currency: this.currency,
          timeframe: this.timeframe,
          dateFrom: dayjs(this.dateFrom)
            .add((-this.requiredHistoryMaxBars * 2) / this.timeframe, "minute")
            .toISOString(),
          dateTo: dayjs(this.dateFrom)
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
          .slice(
            Math.max(
              getRequiredHistoryResult.length - this.requiredHistoryMaxBars,
              0
            )
          );
        // Если загрузили меньше свечей чем запросили
        if (requiredHistoryCandles.length < this.requiredHistoryMaxBars) {
          // Генерируем ошибку
          throw new VError(
            {
              name: "HistoryRangeError",
              info: {
                requiredHistoryMaxBars: this.requiredHistoryMaxBars,
                actualHistoryMaxBars: requiredHistoryCandles.length
              }
            },
            "Can't load history required: %s bars but loaded: %s bars",
            this.requiredHistoryMaxBars,
            requiredHistoryCandles.length
          );
        }

        this.adviserBacktester.setCachedCandles(requiredHistoryCandles);
      }
      // Сохраняем начальное состояние
      await this.save();
      await publishEvents(TASKS_TOPIC, {
        service: BACKTESTER_SERVICE,
        subject: this.eventSubject,
        eventType: TASKS_BACKTESTER_STARTED_EVENT,
        data: {
          taskId: this.taskId
        }
      });

      this.totalBars = await countCandlesDB({
        exchange: this.exchange,
        asset: this.asset,
        currency: this.currency,
        timeframe: this.timeframe,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo
      });

      this.iterations = chunkNumberToArray(this.totalBars, 1440);
      this.prevIteration = 0;

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const iteration of this.iterations) {
        const logsToSave = [];
        // const signalsToSave = [];
        const signalsToSaveDB = [];
        // const ordersToSave = [];
        const ordersToSaveDB = [];
        // const positionsToSave = [];
        const positionsToSaveDB = [];

        const historyCandles = await getCandlesDB({
          exchange: this.exchange,
          asset: this.asset,
          currency: this.currency,
          timeframe: this.timeframe,
          dateFrom: this.dateFrom,
          dateTo: this.dateTo,
          limit: iteration,
          offset: this.prevIteration
        });
        this.prevIteration = iteration;

        for (const candle of historyCandles) {
          await this.adviserBacktester.handleCandle(candle);
          await this.traderBacktester.handleCandle(candle);

          for (const signal of this.adviserBacktester.signals) {
            await this.traderBacktester.handleSignal(signal.data);
          }

          const indicators = {};
          Object.keys(this.adviserBacktester.indicators).forEach(key => {
            indicators[key] = this.adviserBacktester.indicators[key].result;
          });

          // Если есть хотя бы одно событие для отправка
          if (this.adviserBacktester.signals.length > 0) {
            // Отправляем

            this.adviserBacktester.signals.forEach(async signalEvent => {
              signalsToSaveDB.push({
                ...signalEvent.data,
                backtesterId: this.taskId
                /* candleId: candle.id,
                candleTimestamp: candle.timestamp */
              });
              /* Disabled save to storage
              signalsToSave.push({
                RowKey: generateKey(),
                PartitionKey: this.taskId,
                backtesterId: this.taskId,
                backtesterCandleId: candle.id,
                backtesterCandleTimestamp: candle.timestamp,
                signalId: signalEvent.data.signalId,
                signalTimestamp: signalEvent.data.timestamp,
                action: signalEvent.data.action,
                orderType: signalEvent.data.orderType,
                price: signalEvent.data.price,
                priceSource: signalEvent.data.priceSource
              });
              */
            });
          }

          if (this.adviserBacktester.logEvents.length > 0) {
            this.adviserBacktester.logEvents.forEach(logEvent => {
              logsToSave.push({
                ...logEvent.data,
                backtesterId: this.taskId,
                backtesterCandleId: candle.id,
                backtesterCandleTimestamp: candle.timestamp,
                backtesterCandleTime: candle.time,
                backtesterCandleHigh: candle.high,
                backtesterCandleOpen: candle.open,
                backtesterCandleClose: candle.close,
                backtesterCandleLow: candle.low,
                RowKey: generateKey(),
                PartitionKey: this.taskId
              });
            });
          }
          // Если есть хотя бы одно событие для отправка
          if (this.traderBacktester.events.length > 0) {
            const positions = this.traderBacktester.events.filter(
              event => event.eventType === TRADES_POSITION_EVENT.eventType
            );
            const orders = this.traderBacktester.events.filter(
              event => event.eventType === TRADES_ORDER_EVENT.eventType
            );
            positions.forEach(positionEvent => {
              const positionsToSaveDBIndex = positionsToSaveDB.findIndex(
                position =>
                  position.positionId === positionEvent.data.positionId
              );
              if (positionsToSaveDBIndex === -1) {
                positionsToSaveDB.push({
                  ...positionEvent.data,
                  backtesterId: this.taskId,
                  entry: {
                    ...positionEvent.data.entry,
                    date: candle.timestamp
                  }
                });
              } else {
                positionsToSaveDB[positionsToSaveDBIndex] = {
                  ...positionsToSaveDB[positionsToSaveDBIndex],
                  ...positionEvent.data
                };
              }

              /* Disabled save to storage 
              const positionStorageData = {
                backtesterId: this.taskId,
                backtesterCandleId: candle.id,
                backtesterCandleTimestamp: candle.timestamp,
                positionId: positionEvent.data.positionId,
                positionCode: positionEvent.data.settings.positionCode,
                direction: positionEvent.data.direction,
                entryStatus: positionEvent.data.entry.status,
                entryPrice: positionEvent.data.entry.price,
                entryDate: new Date(positionEvent.data.entry.date),
                entryExecuted: positionEvent.data.entry.executed,
                exitStatus: positionEvent.data.exit.status,
                exitPrice: positionEvent.data.exit.price,
                exitDate: new Date(positionEvent.data.exit.date),
                exitExecuted: positionEvent.data.exit.executed,
                RowKey: positionEvent.data.positionId,
                PartitionKey: this.taskId
              };
              const positionsToSaveIndex = positionsToSave.findIndex(
                position =>
                  position.positionId === positionEvent.data.positionId
              );
              if (positionsToSaveIndex === -1) {
                positionsToSave.push(positionStorageData);
              } else {
                positionsToSave[positionsToSaveIndex] = positionStorageData;
              }
              /* */
            });

            orders.forEach(orderEvent => {
              const ordersToSaveDBIndex = ordersToSaveDB.findIndex(
                order => order.orderId === orderEvent.data.orderId
              );
              if (ordersToSaveDBIndex === -1) {
                ordersToSaveDB.push({
                  ...orderEvent.data,
                  backtesterId: this.taskId,
                  candleTimestamp: candle.timestamp
                });
              } else {
                ordersToSaveDB[ordersToSaveDBIndex] = {
                  ...ordersToSaveDB[ordersToSaveDBIndex],
                  ...orderEvent.data
                };
              }
              /* Disabled save to storage 
              ordersToSave.push({
                backtesterId: this.taskId,
                backtesterCandleId: candle.id,
                backtesterCandleTimestamp: candle.timestamp,
                orderId: orderEvent.data.orderId,
                createdAt: new Date(orderEvent.data.createdAt),
                action: orderEvent.data.action,
                orderType: orderEvent.data.orderType,
                price: orderEvent.data.price,
                status: orderEvent.data.status,
                executed: orderEvent.data.executed,
                signalId: orderEvent.data.signalId,
                RowKey: generateKey(),
                PartitionKey: this.taskId
              });
              /* */
            });
          }

          this.adviserBacktester.clearEvents();
          this.traderBacktester.clearEvents();

          // Обновляем статистику

          this.processedBars += 1;
          this.leftBars = this.totalBars - this.processedBars;
          this.percent = Math.round(
            (this.processedBars / this.totalBars) * 100
          );

          if (this.percent > this.oldPercent) {
            this.log("processedBars: ", this.processedBars);
            this.log("leftBars: ", this.leftBars);
            this.log(`${this.percent} %`);
            this.oldPercent = this.percent;
          }
        }

        if (logsToSave.length > 0) await saveBacktesterStratLogs(logsToSave);
        /* Disabled save to storage
        if (signalsToSave.length > 0)
          await saveBacktesterSignals(signalsToSave); 
        if (ordersToSave.length > 0) await saveBacktesterOrders(ordersToSave);
        if (positionsToSave.length > 0)
          await saveBacktesterPositions(positionsToSave);
*/
        if (signalsToSaveDB.length > 0) await saveSignalsDB(signalsToSaveDB);
        if (positionsToSaveDB.length > 0)
          await savePositionsDB(positionsToSaveDB);

        if (ordersToSaveDB.length > 0) await saveOrdersDB(ordersToSaveDB);

        // Сохраняем состояние пачки
        await this.save();
      }
      /* no-restricted-syntax, no-await-in-loop  */
      // Закончили обработку
      this.status = STATUS_FINISHED;
      this.endedAt = dayjs().toISOString();
      // Сохраняем состояние пачки
      await this.save();

      const duration = dayjs(this.endedAt).diff(
        dayjs(this.startedAt),
        "minute"
      );
      await publishEvents(TASKS_TOPIC, {
        service: BACKTESTER_SERVICE,
        subject: this.eventSubject,
        eventType: TASKS_BACKTESTER_FINISHED_EVENT,
        data: {
          taskId: this.taskId,
          duration
        }
      });
      this.log(
        `Backtest finished! From`,
        dayjs(this.dateFrom).toISOString(),
        "to",
        dayjs(this.dateTo).toISOString(),
        "in",
        duration,
        "minutes"
      );
    } catch (error) {
      const err = new VError(
        {
          name: "BacktestError",
          cause: error
        },
        'Failed to execute backtest taskId: "%s"',
        this.taskId
      );
      const errorOutput = createErrorOutput(err);
      this.log(errorOutput);
      // Если есть экземпляр класса
      this.status = STATUS_ERROR;
      this.error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await this.save();
      // Публикуем событие - ошибка
      await publishEvents(ERROR_TOPIC, {
        service: BACKTESTER_SERVICE,
        subject: this.eventSubject,
        eventType: ERROR_BACKTESTER_EVENT,
        data: {
          taskId: this.taskId,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
    }
  }
}

export default Backtester;

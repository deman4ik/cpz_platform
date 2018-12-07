import dayjs from "cpzDayjs";
import VError from "verror";
import {
  STATUS_STARTED,
  STATUS_FINISHED,
  STATUS_ERROR,
  createBacktesterSlug
} from "cpzState";
import publishEvents from "cpzEvents";
import { BACKTESTER_SERVICE } from "cpzServices";
import {
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_FINISHED_EVENT,
  ERROR_BACKTESTER_EVENT,
  LOG_BACKTESTER_EVENT,
  SIGNALS_TOPIC,
  ERROR_TOPIC,
  TASKS_TOPIC,
  TRADES_TOPIC,
  LOG_TOPIC
} from "cpzEventTypes";
import {
  BACKTESTER_SETTINGS_DEFAULTS,
  ADVISER_SETTINGS_DEFAULTS
} from "cpzDefaults";
import { generateKey, chunkNumberToArray } from "cpzUtils/helpers";
import { createErrorOutput } from "cpzUtils/error";
import { saveBacktesterState, saveBacktesterItem } from "cpzStorage";
import DB from "cpzDB";
import AdviserBacktester from "./adviser";
import TraderBacktester from "./trader";

class Backtester {
  constructor(context, state) {
    this.context = context;
    this.initialState = state;
    this.eventSubject = state.eventSubject;
    this.exchange = state.exchange;
    this.asset = state.asset;
    this.ccurrency = state.currency;
    this.timeframe = state.timeframe;
    this.taskId = state.taskId;
    this.robotId = state.robotId;
    this.dateFrom = state.dateFrom;
    this.dateTo = state.dateTo;
    this.settings = {
      debug: state.settings.debug || BACKTESTER_SETTINGS_DEFAULTS.debug
    };
    this.adviserSettings = state.adviserSettings;
    this.traderSettings = state.traderSettings;
    this.requiredHistoryCache =
      state.adviserSettings.requiredHistoryCache ||
      ADVISER_SETTINGS_DEFAULTS.requiredHistoryCache;
    this.requiredHistoryMaxBars =
      state.adviserSettings.requiredHistoryMaxBars ||
      ADVISER_SETTINGS_DEFAULTS.requiredHistoryMaxBars;
    this.totalBars = 0;
    this.processedBars = 0;
    this.leftBars = 0;
    this.percent = 0;
    this.startedAt = dayjs().toJSON();
    this.status = STATUS_STARTED;
    this.db = state.db || new DB();
    this.adviserBacktester = new AdviserBacktester(context, {
      ...state,
      settings: this.adviserSettings
    });
    this.traderBacktester = new TraderBacktester(context, {
      ...state,
      settings: this.traderSettings
    });
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Adviser
   */
  log(...args) {
    if (this._debug) {
      this._context.log.info(`Adviser ${this._eventSubject}:`, ...args);
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
      subject: this._eventSubject,
      eventType: LOG_BACKTESTER_EVENT,
      data: {
        taskId: this._taskId,
        data
      }
    });
  }

  getCurrentState() {
    return {
      ...this.initialState,
      PartitionKey: createBacktesterSlug({
        exchange: this.exchange,
        asset: this.asset,
        currency: this.currency,
        timeframe: this.timeframe,
        robotId: this.robotId
      }),
      RowKey: this.taskId,
      settings: this.settings,
      totalBars: this.totalBars,
      processedBars: this.processedBars,
      leftBars: this.leftBars,
      percent: this.percent,
      startedAt: this.startedAt,
      status: this.status
    };
  }

  async save() {
    try {
      // Сохраняем состояние в локальном хранилище
      await saveBacktesterState(this.getCurrentState());
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
      context.log.info(`Starting backtest ${this.taskId}...`);
      // Если необходим прогрев
      if (this.requiredHistoryCache && this.requiredHistoryMaxBars) {
        // Формируем параметры запроса
        const requiredHistoryRequest = {
          exchange: this.exchange,
          asset: this.asset,
          currency: this.currency,
          timeframe: this.timeframe,
          dateTo: dayjs(this.dateFrom).add(-1, "minute"),
          limit: this.requiredHistoryMaxBars,
          orderBy: "{ timestamp: desc }"
        };
        // Запрашиваем свечи из БД
        const getRequiredHistoryResult = await this.db.getCandles(
          requiredHistoryRequest
        );

        // Если загрузили меньше свечей чем запросили
        if (getRequiredHistoryResult.length < this.requiredHistoryMaxBars) {
          // Генерируем ошибку
          throw new VError(
            {
              name: "HistoryRangeError",
              info: {
                requiredHistoryMaxBars: this.requiredHistoryMaxBars,
                actualHistoryMaxBars: getRequiredHistoryResult.length
              }
            },
            "Can't load history required: %s bars but loaded: %s bars",
            this.requiredHistoryMaxBars,
            getRequiredHistoryResult.length
          );
        }
        // Сортируем загруженные свечи в порядке возрастания
        const requiredHistory = getRequiredHistoryResult.reverse();
        this.adviserBacktester.setCachedCandles(requiredHistory);
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

      this.totalBars = await this.db.countCandles({
        exchange: this.exchange,
        asset: this.asset,
        currency: this.currency,
        timeframe: this.timeframe,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo
      });

      this.iterations = chunkNumberToArray(this.totalBars, 1440);
      this.prevIteration = 0;
      this.iterations.forEach(async iteration => {
        /* eslint-disable no-await-in-loop */
        const historyCandles = await this.db.getCandles({
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
        /* no-await-in-loop */

        /* eslint-disable no-restricted-syntax */
        for (const candle of historyCandles) {
          await this.adviserBacktester.handleCandle(candle);
          await this.traderBacktester.handlePrice({
            price: candle.close
          });

          for (const event of this.adviserBacktester.events) {
            await this.traderBacktester.handleSignal(event.data);
          }
          if (this.debug) {
            // Если есть хотя бы одно событие для отправка
            if (this.adviserBacktester.events.length > 0) {
              // Отправляем
              await publishEvents(SIGNALS_TOPIC, this.adviserBacktester.events);
            }
            // Если есть хотя бы одно событие для отправка
            if (this.traderBacktester.events.length > 0) {
              // Отправляем
              await publishEvents(TRADES_TOPIC, this.traderBacktester.events);
            }
          }
          // Сохраянем состояние итерации
          await saveBacktesterItem({
            PartitionKey: this.taskId,
            RowKey: generateKey(),
            taskId: this.taskId,
            candle,
            adviserEvents: this.adviserBacktester.events,
            traderEvents: this.traderBacktester.events
          });

          // Обновляем статистику
          this.processedBars += 1;
          this.leftBars = this.totalBars - this.processedBars;
          this.percent = Math.round(
            (this.processedBars / this.totalBars) * 100
          );
        }
        // Сохраняем состояние пачки
        await this.save();
        /* no-restricted-syntax */
      });

      // Закончили обработку
      this.status = STATUS_FINISHED;
      this.endedAt = dayjs().toJSON();
      // Сохраняем состояние пачки
      await this.save();

      await publishEvents(TASKS_TOPIC, {
        service: BACKTESTER_SERVICE,
        subject: this.eventSubject,
        eventType: TASKS_BACKTESTER_FINISHED_EVENT,
        data: {
          taskId: this.taskId
        }
      });
      this.context.log.info(`Backtest ${this.taskId} finished!`);
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
      this.context.log.error(JSON.stringify(errorOutput));
      // Если есть экземпляр класса
      this.status = STATUS_ERROR;
      this.error = errorOutput;
      await this.save();
      // Публикуем событие - ошибка
      await publishEvents(ERROR_TOPIC, {
        service: BACKTESTER_SERVICE,
        subject: this.eventSubject,
        eventType: ERROR_BACKTESTER_EVENT,
        data: {
          taskId: this.taskId,
          error: errorOutput
        }
      });
    }
  }
}

export default Backtester;

import VError from "verror";
import { createCurrentPriceSlug, STATUS_PENDING } from "cpz/config/state";
import Log from "cpz/log";
import { createErrorOutput } from "cpz/utils/error";
import publishEvents from "cpz/eventgrid";
import { saveMarketwatcherState } from "cpz/tableStorage/marketwatchers";
import { saveCurrentPrice } from "cpz/tableStorage/currentPrices";
import { saveCachedTick } from "cpz/tableStorage/ticks";
import config from "../config";

const {
  serviceName,
  events: {
    types: { LOG_TOPIC, TICKS_TOPIC, ERROR_TOPIC },
    topics: {
      LOG_MARKETWATCHER_EVENT,
      TICKS_NEWTICK_EVENT,
      ERROR_MARKETWATCHER_EVENT
    }
  }
} = config;

class BaseProvider {
  constructor(state) {
    /* Тема события */
    this._eventSubject = state.eventSubject || state.exchange;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Режима дебага [true,false] */
    this._debug =
      state.debug === undefined || state.debug === null
        ? process.env.DEBUG
        : state.debug;
    /* Биржа */
    this._exchange = state.exchange;
    /* Поставщик данных */
    this._providerType = state.providerType;
    /* Список подписок */
    this._subscriptions = state.subscriptions || [];
    /* Текущий статус сервиса */
    this._status = state.status || STATUS_PENDING;
    /* Текущий статус websocker соединения */
    this._socketStatus = state.status || "none";
    /* Метаданные стореджа */
    this._metadata = state.metadata;
  }

  get status() {
    return this._status;
  }

  get socketStatus() {
    return this._socketStatus;
  }

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Adviser
   */
  log(...args) {
    if (this._debug) {
      Log.debug(`${this._eventSubject}:`, ...args);
      const logData = args.map(arg => JSON.stringify(arg));
      process.send([`Marketwatcher ${this._eventSubject}:`, ...logData]);
    }
  }

  logInfo(...args) {
    Log.info(`${this._eventSubject}:`, ...args);
    const logData = args.map(arg => JSON.stringify(arg));
    process.send([`Marketwatcher ${this._eventSubject}:`, ...logData]);
  }

  logError(...args) {
    Log.error(`${this._eventSubject}:`, ...args);
    const logData = args.map(arg => JSON.stringify(arg));
    process.send([`Marketwatcher ${this._eventSubject}:`, ...logData]);
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
      service: serviceName,
      subject: this._eventSubject,
      eventType: LOG_MARKETWATCHER_EVENT,
      data: {
        taskId: this._taskId,
        data
      }
    });
  }

  /* eslint-disable */
  async start() {}

  async stop() {}

  async subscribe() {}

  async unsubscribe() {}

  /* eslint-enable */

  async _publishTick(tick) {
    try {
      await publishEvents(TICKS_TOPIC, {
        service: serviceName,
        subject: this._eventSubject,
        eventType: TICKS_NEWTICK_EVENT,
        data: {
          ...tick
        }
      });
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "MarketwatcherError",
            cause: new Error(error),
            info: this._getCurrentState()
          },
          'Failed to send NewTick event - task "%s"',
          this._taskId
        )
      );
      this.logError(errorOutput);
      this._error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await this._save();
      await publishEvents(ERROR_TOPIC, {
        service: serviceName,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
    }
  }

  async _saveTrade(tick) {
    try {
      await saveCachedTick(tick);
      if (tick.type === "tick") {
        const slug = createCurrentPriceSlug({
          exchange: tick.exchange,
          asset: tick.asset,
          currency: tick.currency
        });
        await saveCurrentPrice({
          PartitionKey: slug,
          RowKey: slug,
          timestamp: tick.timestamp,
          price: tick.price,
          tickId: tick.tickId,
          candleId: null,
          source: "tick"
        });
      }
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "MarketwatcherError",
            cause: new Error(error),
            info: this._getCurrentState()
          },
          'Failed to send NewTick event - task "%s"',
          this._taskId
        )
      );
      this.logError(errorOutput);
      this._error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await this._save();
      await publishEvents(ERROR_TOPIC, {
        service: serviceName,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
    }
  }

  async _save() {
    this.log(`save()`);
    try {
      // Сохраняем состояние в локальном хранилище
      await saveMarketwatcherState(this._getCurrentState());
    } catch (error) {
      const errorOutput = createErrorOutput(
        new VError(
          {
            name: "MarketwatcherError",
            cause: error,
            info: this._getCurrentState()
          },
          'Failed to update marketwatcher state - task "%s"',
          this._taskId
        )
      );
      this.logError(errorOutput);
      this._error = {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      };
      await publishEvents(ERROR_TOPIC, {
        service: serviceName,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          error: {
            name: errorOutput.name,
            message: errorOutput.message,
            info: errorOutput.info
          }
        }
      });
    }
  }

  _getCurrentState() {
    return {
      taskId: this._taskId,
      PartitionKey: this._exchange,
      RowKey: this._taskId,
      debug: this._debug,
      exchange: this._exchange,
      subscriptions: this._subscriptions,
      status: this._status,
      socketStatus: this._socketStatus,
      error: this._error,
      metadata: this._metadata
    };
  }
}

export default BaseProvider;

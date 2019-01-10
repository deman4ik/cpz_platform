import VError from "verror";
import { STATUS_PENDING } from "cpzState";
import { MARKETWATCHER_SERVICE } from "cpzServices";
import {
  TICKS_NEWTICK_EVENT,
  LOG_MARKETWATCHER_EVENT,
  ERROR_MARKETWATCHER_EVENT,
  LOG_TOPIC,
  ERROR_TOPIC,
  TICKS_TOPIC
} from "cpzEventTypes";
import { createErrorOutput } from "cpzUtils/error";
import publishEvents from "cpzEvents";
import { saveMarketwatcherState, saveCachedTick } from "cpzStorage";

class BaseProvider {
  constructor(state) {
    /* Тема события */
    this._eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Режима дебага [true,false] */
    this._debug = state.debug || false;
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

  /**
   * Логирование в консоль
   *
   * @param {*} args
   * @memberof Adviser
   */
  log(...args) {
    if (this._debug) {
      const logData = args.map(arg => JSON.stringify(arg));
      process.send([`Marketwatcher ${this._eventSubject}:`, ...logData]);
    }
  }

  logError(...args) {
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
      service: MARKETWATCHER_SERVICE,
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
        service: MARKETWATCHER_SERVICE,
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
        service: MARKETWATCHER_SERVICE,
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
        service: MARKETWATCHER_SERVICE,
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
        service: MARKETWATCHER_SERVICE,
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

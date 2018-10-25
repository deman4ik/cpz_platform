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
import { modeToStr } from "cpzUtils/helpers";
import { saveMarketwatcherState, saveCachedTick } from "../tableStorage";

class BaseProvider {
  constructor(state) {
    /* Тема события */
    this._eventSubject = state.eventSubject;
    /* Уникальный идентификатор задачи */
    this._taskId = state.taskId;
    /* Уникальный идентификатор хоста */
    this._hostId = process.env.HOST_ID;
    /* Режим работы ['backtest', 'emulator', 'realtime'] */
    this._mode = state.mode;
    /* Режима дебага [true,false] */
    this._debug = state.debug || false;
    /* Поставщик данных */
    this._provider = state.provider;
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
  log(msg) {
    if (this._debug) {
      process.send(`Marketwatcher ${this._eventSubject}: ${msg}`);
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
      service: MARKETWATCHER_SERVICE,
      subject: this._eventSubject,
      eventType: LOG_MARKETWATCHER_EVENT,
      data: {
        taskId: this._taskId,
        hostId: this._hostId,
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

  /**
   * Генерация темы события NewSignal
   *
   * @returns subject
   * @memberof Candlebatcher
   */
  _createSubject() {
    return `${this._exchange}/${this._asset}/${this._currency}.${modeToStr(
      this._mode
    )}`;
  }

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
          'Failed to send NewTick event - task "%s" on host "%s"',
          this._taskId,
          this._hostId
        )
      );
      this._error = errorOutput;
      await this._save();
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          hostId: this._hostId,
          error: errorOutput
        }
      });
    }
  }

  async _saveTick(tick) {
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
          'Failed to send NewTick event - task "%s" on host "%s"',
          this._taskId,
          this._hostId
        )
      );
      this._error = errorOutput;
      await this._save();
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          hostId: this._hostId,
          error: errorOutput
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
          'Failed to update marketwatcher state - task "%s" on host "%s"',
          this._taskId,
          this._hostId
        )
      );
      this._error = errorOutput;
      await publishEvents(ERROR_TOPIC, {
        service: MARKETWATCHER_SERVICE,
        subject: this._eventSubject,
        eventType: ERROR_MARKETWATCHER_EVENT,
        data: {
          taskId: this._taskId,
          hostId: this._hostId,
          error: errorOutput
        }
      });
    }
  }

  _getCurrentState() {
    return {
      taskId: this._taskId,
      hostId: this._hostId,
      mode: this._mode,
      debug: this._debug,
      subscriptions: this._subscriptions,
      status: this._status,
      socketStatus: this._socketStatus,
      error: this._error,
      metadata: this._metadata
    };
  }
}

export default BaseProvider;

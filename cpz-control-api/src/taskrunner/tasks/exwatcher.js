import dayjs from "cpz/utils/lib/dayjs";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PENDING,
  STATUS_FINISHED,
  STATUS_ERROR,
  VALID_TIMEFRAMES,
  createWatcherSlug,
  createExWatcherTaskSubject
} from "cpz/config/state";
import {
  TASKS_EXWATCHER_STARTED_EVENT,
  TASKS_EXWATCHER_STOPPED_EVENT
} from "cpz/events/types/tasks/exwatcher";
import { ERROR_EXWATCHER_ERROR_EVENT } from "cpz/events/types/error";
import Log from "cpz/log";
import { combineCandlebatcherSettings } from "cpz/utils/settings";

class ExWatcher {
  constructor(state) {
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._taskId = createWatcherSlug({
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency
    });
    this._timeframes = state.timeframs || VALID_TIMEFRAMES;
    this._marketwatcherProviderType =
      state.marketwatcherProviderType || "cryptocompare";
    this._candlebatcherProviderType = state.candlebatcherProviderType || "ccxt";
    this._candlebatcherSettings = combineCandlebatcherSettings(
      state.candlebatcherSettings
    );
    this._marketwatcherId = state.marketwatcherId;
    this._marketwatcherStatus = state.marketwatcherStatus || STATUS_PENDING;
    this._marketwatcherError = state.marketwatcherError;
    this._candlebatcherId = state.candlebatcherId;
    this._candlebatcherStatus = state.candlebatcherStatus || STATUS_PENDING;
    this._cabdlebatcherError = state.candlebatcherError;
    this._importerHistoryId = state.importerHistoryId;
    this._importerHistoryStatus = state.importerHistoryStatus || STATUS_PENDING;
    this._importerHistoryError = state.importerHistoryError;
    this._importerCurrentId = state.importerCurrentId;
    this._importerCurrentStatus = state.importerCurrentStatus || STATUS_PENDING;
    this._importerCurrentError = state.importerCurrentError;
    this._status = state.status || STATUS_STARTING;
    this._startedAt = state.startedAt;
    this._stoppedAt = state.stoppedAt;
    this._error = state.error;
    this._metadata = state.metadata;
    this._events = {};
  }

  _setStatus() {
    if (
      this._status === STATUS_STARTING &&
      this._importerHistoryStatus === STATUS_FINISHED &&
      this._candlebatcherStatus === STATUS_STARTED &&
      this._marketwatcherStatus === STATUS_STARTED &&
      this._importerCurrentStatus === STATUS_FINISHED
    ) {
      this._startedAt = dayjs.utc().toISOString();
      this._stoppedAt = null;
      this._status = STATUS_STARTED;
      this._error = null;
      this._events.started = {
        eventType: TASKS_EXWATCHER_STARTED_EVENT,
        eventData: {
          subject: createExWatcherTaskSubject({
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency
          }),

          data: {
            taskId: this._taskId
          }
        }
      };
    } else if (
      this._status === STATUS_STOPPING &&
      this._candlebatcherStatus === STATUS_STOPPED &&
      this._marketwatcherStatus === STATUS_STOPPED
    ) {
      this._status = STATUS_STOPPED;
      this._events.stopped = {
        eventType: TASKS_EXWATCHER_STOPPED_EVENT,
        eventData: {
          subject: createExWatcherTaskSubject({
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency
          }),

          data: {
            taskId: this._taskId
          }
        }
      };
    }
  }

  get exchange() {
    return this._exchange;
  }

  get asset() {
    return this._asset;
  }

  get currency() {
    return this._currency;
  }

  get taskId() {
    return this._taskId;
  }

  get timeframes() {
    return this._timeframes;
  }

  get marketwatcherProviderType() {
    return this._marketwatcherProviderType;
  }

  get candlebatcherProviderType() {
    return this._candlebatcherProviderType;
  }

  get candlebatcherSettings() {
    return this._candlebatcherSettings;
  }

  set candlebatcherSettings(candlebatcherSettings) {
    this._candlebatcherSettings = {
      ...this._candlebatcherSettings,
      ...candlebatcherSettings
    };
  }

  get marketwatcherId() {
    return this._marketwatcherId;
  }

  set marketwatcherId(marketwatcherId) {
    this._marketwatcherId = marketwatcherId;
  }

  get marketwatcherStatus() {
    return this._marketwatcherStatus;
  }

  set marketwatcherStatus(marketwatcherStatus) {
    this._marketwatcherStatus = marketwatcherStatus;
    this._setStatus();
  }

  set marketwatcherError(e) {
    this._marketwatcherError = this._parseError(e);
    if (this._marketwatcherError.critical) {
      this._marketwatcherStatus = STATUS_ERROR;
      this._status = STATUS_ERROR;
    }
    this._createErrorEvent(this._marketwatcherError);
  }

  get candlebatcherId() {
    return this._candlebatcherId;
  }

  set candlebatcherId(candlebatcherId) {
    this._candlebatcherId = candlebatcherId;
  }

  get candlebatcherStatus() {
    return this._candlebatcherStatus;
  }

  set candlebatcherStatus(candlebatcherStatus) {
    this._candlebatcherStatus = candlebatcherStatus;
    this._setStatus();
  }

  set candlebatcherError(e) {
    this._candlebatcherError = this._parseError(e);
    if (this._candlebatcherError.critical) {
      this._candlebatcherStatus = STATUS_ERROR;
      this._status = STATUS_ERROR;
    }
    this._createErrorEvent(this._candlebatcherError);
  }

  get importerHistoryId() {
    return this._importerHistoryId;
  }

  set importerHistoryId(importerHistoryId) {
    this._importerHistoryId = importerHistoryId;
  }

  get importerHistoryStatus() {
    return this._importerHistoryStatus;
  }

  set importerHistoryStatus(importerHistoryStatus) {
    this._importerHistoryStatus = importerHistoryStatus;
    this._setStatus();
  }

  set importerHistoryError(e) {
    this._importerHistoryError = this._parseError(e);
    if (this._importerHistoryError.critical) {
      this._importerHistoryStatus = STATUS_ERROR;
      this._status = STATUS_ERROR;
    }
    this._createErrorEvent(this._importerHistoryError);
  }

  get importerCurrentId() {
    return this._importerCurrentId;
  }

  set importerCurrentId(importerCurrentId) {
    this._importerCurrentId = importerCurrentId;
  }

  get importerCurrentStatus() {
    return this._importerCurrentStatus;
  }

  set importerCurrentStatus(importerCurrentStatus) {
    this._importerCurrentStatus = importerCurrentStatus;
    this._setStatus();
  }

  set importerCurrentError(e) {
    this._importerCurrentError = this._parseError(e);
    if (this._importerCurrentError.critical) {
      this._importerCurrentStatus = STATUS_ERROR;
      this._status = STATUS_ERROR;
    }
    this._createErrorEvent(this._importerCurrentError);
  }

  get status() {
    return this._status;
  }

  set status(status) {
    this._status = status;
  }

  get error() {
    return this._error;
  }

  set error(error) {
    this._error = error;
    this._createErrorEvent(this._error);
  }

  _parseError({ name, message, info, stack }) {
    const { critical, userMessage } = info;
    return {
      name,
      message: userMessage || message,
      critical,
      info,
      stack
    };
  }

  _createErrorEvent(error) {
    this._events.error = {
      eventType: ERROR_EXWATCHER_ERROR_EVENT,
      eventData: {
        subject: createExWatcherTaskSubject({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency
        }),
        data: {
          taskId: this._taskId,
          error
        }
      }
    };
  }

  get events() {
    return Object.values(this._events);
  }

  get state() {
    return {
      PartitionKey: this._taskId,
      RowKey: this._taskId,
      taskId: this._taskId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframes: this._timeframes,
      marketwatcherProviderType: this._marketwatcherProviderType,
      candlebatcherProviderType: this._candlebatcherProviderType,
      candlebatcherSettings: this._candlebatcherSettings,
      marketwatcherId: this._marketwatcherId,
      marketwatcherStatus: this._marketwatcherStatus,
      marketwatcherError: this._marketwatcherError,
      candlebatcherId: this._candlebatcherId,
      candlebatcherStatus: this._candlebatcherStatus,
      candlebatcherError: this._candlebatcherError,
      importerHistoryId: this._importerHistoryId,
      importerHistoryStatus: this._importerHistoryStatus,
      importerHistoryError: this._importerHistoryError,
      importerCurrentId: this._importerCurrentId,
      importerCurrentStatus: this._importerCurrentStatus,
      importerCurrentError: this._importerCurrentError,
      status: this._status,
      startedAt: this._startedAt,
      stoppedAt: this._stoppedAt,
      error: this._error,
      metadata: this._metadata
    };
  }
}

export default ExWatcher;

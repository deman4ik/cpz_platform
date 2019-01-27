import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PENDING,
  STATUS_ERROR,
  STATUS_FINISHED,
  createWatcherSlug,
  createExWatcherTaskSubject
} from "cpzState";
import {
  TASKS_TOPIC,
  TASKS_EXWATCHER_STARTED_EVENT,
  TASKS_EXWATCHER_STOPPED_EVENT
} from "cpzEventTypes";
import publishEvents from "cpzEvents";
import { saveExWatcherState } from "cpzStorage/exwatchers";
import { CANDLEBATCHER_SETTINGS_DEFAULTS } from "cpzDefaults";

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
    this._timeframes = state.timeframs || [1, 5, 15, 30, 60, 120, 240, 1440];
    this._marketwatcherProviderType =
      state.marketwatcherProviderType || "cryptocompare";
    this._candlebatcherProviderType = state.candlebatcherProviderType || "ccxt";
    this._candlebatcherSettings = {
      debug:
        (state.candlebatcherSettings && state.candlebatcherSettings.debug) ||
        CANDLEBATCHER_SETTINGS_DEFAULTS.debug,
      proxy:
        (state.candlebatcherSettings && state.candlebatcherSettings.proxy) ||
        CANDLEBATCHER_SETTINGS_DEFAULTS.proxy,
      requiredHistoryMaxBars:
        (state.candlebatcherSettings &&
          state.candlebatcherSettings.requiredHistoryMaxBars) ||
        CANDLEBATCHER_SETTINGS_DEFAULTS.requiredHistoryMaxBars
    };
    this._marketwatcherId = state.marketwatcherId;
    this._marketwatcherStatus = state.marketwatcherStatus || STATUS_PENDING;
    this._candlebatcherId = state.candlebatcherId;
    this._candlebatcherStatus = state.candlebatcherStatus || STATUS_PENDING;
    this._importerHistoryId = state.importerHistoryId;
    this._importerHistoryStatus = state.importerHistoryStatus || STATUS_PENDING;
    this._importerCurrentId = state.importerCurrentId;
    this._importerCurrentStatus = state.importerCurrentStatus || STATUS_PENDING;
    this._status = state.status || STATUS_PENDING;
    this._error = state.error;
    this._metadata = state.metadata;
    this._event = null;
  }

  _setStatus() {
    if (
      this._importerHistoryStatus === STATUS_FINISHED &&
      this._candlebatcherStatus === STATUS_STARTED &&
      this._marketwatcherStatus === STATUS_STARTED &&
      this._importerCurrentStatus === STATUS_FINISHED
    ) {
      this._status = STATUS_STARTED;
      this._error = null;
      this._event = {
        id: uuid(),
        dataVersion: "1.0",
        eventTime: new Date(),
        subject: createExWatcherTaskSubject({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency
        }),
        eventType: TASKS_EXWATCHER_STARTED_EVENT.eventType,
        data: {
          taskId: this._taskId
        }
      };
      return;
    }

    if (
      this._candlebatcherStatus === STATUS_STOPPED ||
      this._marketwatcherStatus === STATUS_STOPPED
    ) {
      this._status = STATUS_STOPPED;
      this._event = {
        id: uuid(),
        dataVersion: "1.0",
        eventTime: new Date(),
        subject: createExWatcherTaskSubject({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency
        }),
        eventType: TASKS_EXWATCHER_STOPPED_EVENT.eventType,
        data: {
          taskId: this._taskId
        }
      };
      return;
    }

    if (
      this._candlebatcherStatus === STATUS_STOPPING ||
      this._marketwatcherStatus === STATUS_STOPPING
    ) {
      this._status = STATUS_STOPPING;
      return;
    }

    if (
      this._candlebatcherStatus === STATUS_ERROR ||
      this._marketwatcherStatus === STATUS_ERROR
    ) {
      this._status = STATUS_ERROR;
      return;
    }
    this._status = STATUS_PENDING;
  }

  get taskId() {
    return this._taskId;
  }

  get status() {
    return this._status;
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

  get candlebatcherSettings() {
    return this._candlebatcherSettings;
  }

  set candlebatcherSettings(candlebatcherSettings) {
    this._candlebatcherSettings = {
      ...this._candlebatcherSettings,
      ...candlebatcherSettings
    };
  }

  set error(error) {
    this._error = error;
  }

  get events() {
    return this._events;
  }

  getCurrentState() {
    return {
      PartitionKey: this._taskId,
      RowKey: this._taskId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframes: this._timeframes,
      marketwatcherProviderType: this._marketwatcherProviderType,
      candlebatcherProviderType: this._candlebatcherProviderType,
      candlebatcherSettings: this._candlebatcherSettings,
      marketwatcherId: this._marketwatcherId,
      marketwatcherStatus: this._marketwatcherStatus,
      candlebatcherId: this._candlebatcherId,
      candlebatcherStatus: this._candlebatcherStatus,
      importerHistoryId: this._importerHistoryId,
      importerHistoryStatus: this._importerHistoryStatus,
      importerCurrentId: this._importerCurrentId,
      importerCurrentStatus: this._importerCurrentStatus,
      status: this._status,
      error: this._error,
      metadata: this._metadata
    };
  }

  async save() {
    try {
      await saveExWatcherState(this.getCurrentState());
      if (this._events) {
        await publishEvents(TASKS_TOPIC, [this._event]);
        this._event = null;
      }
    } catch (error) {
      throw new VError(
        {
          name: "ExWatcherError",
          cause: error,
          info: {
            id: this._taskId
          }
        },
        'Failed to save exchange data watcher "%s" state',
        this._taskId
      );
    }
  }
}

export default ExWatcher;

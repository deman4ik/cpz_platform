import VError from "verror";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PENDING,
  STATUS_ERROR,
  STATUS_FINISHED,
  createWatcherSlug
} from "cpzState";
import { saveExWatcherState } from "cpzStorage";
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
      state.marketwatcherProviderType || "сryptoсompare";
    this._candlebatcherProviderType = state.candlebatcherProviderType || "ccxt";
    this._candlebatcherSettings = {
      debug:
        state._candlebatcherSettings.debug ||
        CANDLEBATCHER_SETTINGS_DEFAULTS.debug,
      proxy:
        state._candlebatcherSettings.proxy ||
        CANDLEBATCHER_SETTINGS_DEFAULTS.proxy,
      requiredHistoryMaxBars:
        state._candlebatcherSettings.requiredHistoryMaxBars ||
        CANDLEBATCHER_SETTINGS_DEFAULTS.requiredHistoryMaxBars
    };
    this._marketwatcherId = state.marketwatcherId;
    this._marketwatcherStatus = state.marketwatcherStatus;
    this._candlebatcherId = state.candlebatcherId;
    this._candlebatcherStatus = state.candlebatcherStatus;
    this._importerHistoryId = state.importerHistoryId;
    this._importerHistoryStatus = state.importerHistoryStatus;
    this._importerCurrentId = state.importerCurrentId;
    this._importerCurrentStatus = state.importerCurrentStatus;
    this._status = state.status || STATUS_STOPPED;
    this._error = state.error;
    this._metadata = state.metadata;
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
      return;
    }

    if (
      this._importerHistoryStatus === STATUS_STARTED ||
      this._candlebatcherStatus === STATUS_STARTING ||
      this._marketwatcherStatus === STATUS_STARTING ||
      this._importerCurrentStatus === STATUS_STARTED
    ) {
      this._status = STATUS_STARTING;
      this._error = null;
      return;
    }

    if (
      this._candlebatcherStatus === STATUS_STOPPED ||
      this._marketwatcherStatus === STATUS_STOPPED
    ) {
      this._status = STATUS_STOPPED;
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

  set marketwatcherId(marketwatcherId) {
    this._marketwatcherId = marketwatcherId;
  }

  set marketwatcherStatus(marketwatcherStatus) {
    this._marketwatcherStatus = marketwatcherStatus;
    this._setStatus();
  }

  set candlebatcherId(candlebatcherId) {
    this._candlebatcherId = candlebatcherId;
  }

  set candlebatcherStatus(candlebatcherStatus) {
    this._candlebatcherStatus = candlebatcherStatus;
    this._setStatus();
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
      importerCurrentStatus: this._importerCurrenctStatus,
      status: this._status,
      error: this._error,
      metadata: this._metadata
    };
  }

  async save() {
    try {
      await saveExWatcherState(this.getCurrentState());
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

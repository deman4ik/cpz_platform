import VError from "verror";
import { v4 as uuid } from "uuid";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PENDING,
  STATUS_ERROR,
  STATUS_FINISHED,
  createBacktestSlug,
  createBacktestTaskSubject
} from "cpzState";
import {
  TASKS_TOPIC,
  TASKS_BACKTEST_STARTED_EVENT,
  TASKS_BACKTEST_STOPPED_EVENT,
  TASKS_BACKTEST_FINISHED_EVENT
} from "cpzEventTypes";
import publishEvents from "cpzEvents";
import { saveBacktestState } from "cpzStorage";
import {
  BACKTESTER_SETTINGS_DEFAULTS,
  ADVISER_SETTINGS_DEFAULTS,
  TRADER_SETTINGS_DEFAULTS
} from "cpzDefaults";

class Backtest {
  constructor(state) {
    this._robotId = state.robotId;
    this._userId = state.userId;
    this._strategyName = state.strategyName;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._taskId = state.taskId || uuid();
    this._dateFrom = state.dateFrom;
    this._dateTo = state.dateTo;
    this._settings = {
      debug:
        (state.settings && state.settings.debug) ||
        BACKTESTER_SETTINGS_DEFAULTS.debug
    };
    this._adviserSettings = {
      debug:
        (state.adviserSettings && state.adviserSettings.debug) ||
        ADVISER_SETTINGS_DEFAULTS.debug,
      strategyParameters:
        (state.adviserSettings && state.adviserSettings.strategyParameters) ||
        ADVISER_SETTINGS_DEFAULTS.strategyParameters,
      requiredHistoryCache:
        (state.adviserSettings && state.adviserSettings.requiredHistoryCache) ||
        ADVISER_SETTINGS_DEFAULTS.requiredHistoryCache,
      requiredHistoryMaxBars:
        (state.adviserSettings &&
          state.adviserSettings.requiredHistoryMaxBars) ||
        ADVISER_SETTINGS_DEFAULTS.requiredHistoryMaxBars
    };
    this._traderSettings = {
      debug:
        (state.traderSettings && state.traderSettings.debug) ||
        TRADER_SETTINGS_DEFAULTS.debug,
      mode:
        (state.traderSettings && state.traderSettings.mode) ||
        TRADER_SETTINGS_DEFAULTS.mode,
      slippageStep:
        (state.traderSettings && state.traderSettings.slippageStep) ||
        TRADER_SETTINGS_DEFAULTS.slippageStep,
      deviation:
        (state.traderSettings && state.traderSettings.deviation) ||
        TRADER_SETTINGS_DEFAULTS.deviation,
      volume:
        (state.traderSettings && state.traderSettings.volume) ||
        TRADER_SETTINGS_DEFAULTS.volume,
      openOrderTimeout:
        (state.traderSettings && state.traderSettings.openOrderTimeout) ||
        TRADER_SETTINGS_DEFAULTS.openOrderTimeout
    };
    this._backtesterId = state.backtesterId;
    this._backtesterStatus = state.backtesterStatus || STATUS_PENDING;
    this._importerId = state.importerId;
    this._importerStatus = state.importerStatus || STATUS_PENDING;
    this._status = state.status || STATUS_PENDING;
    this._error = state.error;
    this._metadata = state.metadata;
    this._event = null;
  }

  _setStatus() {
    if (
      this._importerStatus === STATUS_FINISHED &&
      this._backtesterStatus === STATUS_STARTED
    ) {
      this._status = STATUS_STARTED;
      this._error = null;
      this._event = {
        id: uuid(),
        dataVersion: "1.0",
        eventTime: new Date(),
        subject: createBacktestTaskSubject({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: this._timeframe,
          robotId: this._robotId,
          userId: this._userId
        }),
        eventType: TASKS_BACKTEST_STARTED_EVENT.eventType,
        data: {
          taskId: this._taskId
        }
      };
      return;
    }

    if (this._backtesterStatus === STATUS_STOPPED) {
      this._status = STATUS_STOPPED;
      this._event = {
        id: uuid(),
        dataVersion: "1.0",
        eventTime: new Date(),
        subject: createBacktestTaskSubject({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: this._timeframe,
          robotId: this._robotId,
          userId: this._userId
        }),
        eventType: TASKS_BACKTEST_STOPPED_EVENT.eventType,
        data: {
          taskId: this._taskId
        }
      };
      return;
    }

    if (this._backtesterStatus === STATUS_FINISHED) {
      this._status = STATUS_FINISHED;
      this._event = {
        id: uuid(),
        dataVersion: "1.0",
        eventTime: new Date(),
        subject: createBacktestTaskSubject({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: this._timeframe,
          robotId: this._robotId,
          userId: this._userId
        }),
        eventType: TASKS_BACKTEST_FINISHED_EVENT.eventType,
        data: {
          taskId: this._taskId
        }
      };
      return;
    }
    if (this._backtesterStatus === STATUS_STOPPING) {
      this._status = STATUS_STOPPING;
      return;
    }

    if (
      this._importerStatus === STATUS_ERROR ||
      this._backtesterStatus === STATUS_ERROR
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

  get backtesterId() {
    return this._backtesterId;
  }

  set backtesterId(backtesterId) {
    this._backtesterId = backtesterId;
  }

  get backtesterStatus() {
    return this._backtesterStatus;
  }

  set backtesterStatus(backtesterStatus) {
    this._backtesterStatus = backtesterStatus;
    this._setStatus();
  }

  get importerId() {
    return this._importerId;
  }

  set importerId(importerId) {
    this._importerId = importerId;
  }

  get importerStatus() {
    return this._importerStatus;
  }

  set importerStatus(importerStatus) {
    this._importerStatus = importerStatus;
    this._setStatus();
  }

  get settings() {
    return this._settings;
  }

  set settings(settings) {
    this._settings = {
      ...this._settings,
      ...settings
    };
  }

  get adviserSettings() {
    return this._adviserSettings;
  }

  set adviserSettings(adviserSettings) {
    this._adviserSettings = {
      ...this._adviserSettings,
      ...adviserSettings
    };
  }

  get traderSettings() {
    return this._traderSettings;
  }

  set traderSettings(traderSettings) {
    this._traderSettings = {
      ...this._traderSettings,
      ...traderSettings
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
      PartitionKey: createBacktestSlug({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        robotId: this._robotId
      }),
      RowKey: this._taskId,
      taskId: this._taskId,
      robotId: this._robotId,
      userId: this._userId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      dateFrom: this._dateFrom,
      dateTo: this._dateTo,
      settings: this._settings,
      adviserSettings: this._adviserSettings,
      traderSettings: this._traderSettings,
      backtesterId: this._backtesterId,
      backtesterStatus: this._backtesterStatus,
      importerId: this._importerId,
      importerStatus: this._importerStatus,
      status: this._status,
      error: this._error,
      metadata: this._metadata
    };
  }

  async save() {
    try {
      await saveBacktestState(this.getCurrentState());
      if (this._event) {
        await publishEvents(TASKS_TOPIC, [this._event]);
        this._event = null;
      }
    } catch (error) {
      throw new VError(
        {
          name: "BacktestError",
          cause: error,
          info: {
            id: this._taskId
          }
        },
        'Failed to save backtest "%s" state',
        this._taskId
      );
    }
  }
}

export default Backtest;

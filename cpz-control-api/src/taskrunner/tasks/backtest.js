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
import { saveBacktestState } from "cpzStorage/backtests";
import {
  combineBacktesterSettings,
  combineAdvserSettings,
  combineTraderSettings
} from "cpzUtils/settings";

class Backtest {
  constructor(context, state) {
    this._context = context;
    this._robotId = state.robotId;
    this._userId = state.userId;
    this._strategyName = state.strategyName;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._dateFrom = state.dateFrom;
    this._dateTo = state.dateTo;
    this._settings = combineBacktesterSettings(state.settings);
    this._adviserSettings = combineAdvserSettings(state.adviserSettings);
    this._traderSettings = combineTraderSettings(state.traderSettings);
    this._backtesterId = state.backtesterId || uuid();
    this._taskId = this._backtesterId;
    this._backtesterStatus = state.backtesterStatus || STATUS_PENDING;
    this._importerId = state.importerId;
    this._importerStatus = state.importerStatus || STATUS_PENDING;
    this._status = state.status || STATUS_PENDING;
    this._error = state.error;
    this._metadata = state.metadata;
    this._event = null;
  }

  log(...args) {
    this._context.log.info(`Backtest ${this._robotId}:`, ...args);
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

import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_PENDING,
  STATUS_FINISHED,
  STATUS_ERROR,
  createBacktestSlug,
  createBacktestTaskSubject
} from "cpz/config/state";
import {
  TASKS_BACKTEST_STARTED_EVENT,
  TASKS_BACKTEST_STOPPED_EVENT,
  TASKS_BACKTEST_FINISHED_EVENT
} from "cpz/events/types/tasks/backtest";
import { ERROR_BACKTEST_ERROR_EVENT } from "cpz/events/types/error";
import { v4 as uuid } from "uuid";
import {
  combineBacktesterSettings,
  combineAdviserSettings,
  combineTraderSettings
} from "cpz/utils/settings";

class Backtest {
  constructor(state) {
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
    this._adviserSettings = combineAdviserSettings(state.adviserSettings);
    this._traderSettings = combineTraderSettings(state.traderSettings);
    this._backtesterId = state.backtesterId || uuid();
    this._taskId = this._backtesterId;
    this._backtesterStatus = state.backtesterStatus || STATUS_PENDING;
    this._backtesterError = state.backtesterError;
    this._importerId = state.importerId;
    this._importerStatus = state.importerStatus || STATUS_PENDING;
    this._importerError = state.importerError;
    this._status = state.status || STATUS_STARTING;
    this._error = state.error;
    this._metadata = state.metadata;
    this._events = {};
  }

  _setStatus() {
    if (
      this._status === STATUS_STARTING &&
      this._importerStatus === STATUS_FINISHED &&
      this._backtesterStatus === STATUS_STARTED
    ) {
      this._status = STATUS_STARTED;
      this._error = null;
      this._events.started = {
        eventType: TASKS_BACKTEST_STARTED_EVENT,
        eventData: {
          subject: createBacktestTaskSubject({
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency,
            timeframe: this._timeframe,
            robotId: this._robotId,
            userId: this._userId
          }),

          data: {
            taskId: this._taskId
          }
        }
      };
    } else if (this._backtesterStatus === STATUS_STOPPED) {
      this._status = STATUS_STOPPED;
      this._events.stopped = {
        eventType: TASKS_BACKTEST_STOPPED_EVENT,
        eventData: {
          subject: createBacktestTaskSubject({
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency,
            timeframe: this._timeframe,
            robotId: this._robotId,
            userId: this._userId
          }),
          data: {
            taskId: this._taskId
          }
        }
      };
    } else if (this._backtesterStatus === STATUS_FINISHED) {
      this._status = STATUS_FINISHED;
      this._events.finished = {
        eventType: TASKS_BACKTEST_FINISHED_EVENT,
        eventData: {
          subject: createBacktestTaskSubject({
            exchange: this._exchange,
            asset: this._asset,
            currency: this._currency,
            timeframe: this._timeframe,
            robotId: this._robotId,
            userId: this._userId
          }),
          data: {
            taskId: this._taskId
          }
        }
      };
    }
  }

  get robotId() {
    return this._robotId;
  }

  get userId() {
    return this._userId;
  }

  get strategyName() {
    return this._strategyName;
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

  get timeframe() {
    return this._timeframe;
  }

  get dateFrom() {
    return this._dateFrom;
  }

  get dateTo() {
    return this._dateTo;
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

  get taskId() {
    return this._taskId;
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

  get status() {
    return this._status;
  }

  set status(status) {
    this._status = status;
  }

  set error(error) {
    this._error = error;
    this._createErrorEvent(this._error);
  }

  set importerError(e) {
    this._importerError = this._parseError(e);
    if (this._importerError.critical) {
      this._importerStatus = STATUS_ERROR;
      this._status = STATUS_ERROR;
    }
    this._createErrorEvent(this._importerError);
  }

  set backtesterError(e) {
    this._backtesterError = this._parseError(e);
    if (this._backtesterError.critical) {
      this._backtesterStatus = STATUS_ERROR;
      this._status = STATUS_ERROR;
    }
    this._createErrorEvent(this._backtesterError);
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
      eventType: ERROR_BACKTEST_ERROR_EVENT,
      eventData: {
        subject: createBacktestTaskSubject({
          exchange: this._exchange,
          asset: this._asset,
          currency: this._currency,
          timeframe: this._timeframe,
          robotId: this._robotId,
          userId: this._userId
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
      backtesterError: this._backtesterError,
      importerId: this._importerId,
      importerStatus: this._importerStatus,
      importerError: this._importerError,
      status: this._status,
      error: this._error,
      metadata: this._metadata
    };
  }
}

export default Backtest;

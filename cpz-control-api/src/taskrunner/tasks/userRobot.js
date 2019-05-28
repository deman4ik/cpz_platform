import dayjs from "cpz/utils/dayjs";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_STOPPED_USER,
  STATUS_STOPPING,
  STATUS_PENDING,
  STATUS_WARN,
  STATUS_ERROR,
  createRobotSlug
} from "cpz/config/state";
import { TASKS_USERROBOT_HIST_EVENT } from "cpz/events/types/tasks/userRobot";
import {
  combineCandlebatcherSettings,
  combineAdviserSettings,
  combineTraderSettings
} from "cpz/utils/settings";

class UserRobot {
  constructor(state) {
    this._id = state.id;
    this._robotId = state.robotId;
    this._userId = state.userId;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._strategyName = state.strategyName;
    this._candlebatcherSettings = combineCandlebatcherSettings(
      state.candlebatcherSettings
    );
    this._adviserSettings = combineAdviserSettings(state.adviserSettings);
    this._traderSettings = combineTraderSettings(state.traderSettings);
    this._exwatcherId = state.exwatcherId;
    this._exwatcherStatus = state.exwatcherStatus || STATUS_PENDING;
    this._exwatcherError = state.exwatcherError;
    this._adviserId = state.adviserId;
    this._adviserStatus = state.adviserStatus || STATUS_PENDING;
    this._adviserError = state.adviserError;
    this._traderId = state.traderId;
    this._traderStatus = state.traderStatus || STATUS_PENDING;
    this._traderError = state.traderError;
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
      this._traderStatus === STATUS_STARTED &&
      this._adviserStatus === STATUS_STARTED &&
      this._exwatcherStatus === STATUS_STARTED
    ) {
      this._startedAt = dayjs.utc().toISOString();
      this._stoppedAt = null;
      this._status = STATUS_STARTED;
      this._error = null;
      this._exwatcherError = null;
      this._adviserStatus = null;
      this._traderError = null;
      this._events.started = {
        eventType: TASKS_USERROBOT_HIST_EVENT,
        eventData: {
          subject: this._id,
          data: {
            id: this._id,
            candlebatcherSettings: this._candlebatcherSettings,
            adviserSettings: this._adviserSettings,
            traderSettings: this._traderSettings,
            action: STATUS_STARTED,
            startedAt: this._startedAt,
            stoppedAt: this._stoppedAt
          }
        }
      };
    } else if (
      this._traderStatus === STATUS_STOPPED ||
      (this._status === STATUS_STOPPING &&
        (this._traderStatus === STATUS_STOPPED ||
          this._traderStatus === STATUS_PENDING ||
          this._traderStatus === STATUS_ERROR))
    ) {
      this._stoppedAt = dayjs.utc().toISOString();
      this._status = STATUS_STOPPED;
      this._traderStatus = STATUS_STOPPED;
      this._events.stopped = {
        eventType: TASKS_USERROBOT_HIST_EVENT,
        eventData: {
          subject: this._id,
          data: {
            id: this._id,
            candlebatcherSettings: this._candlebatcherSettings,
            adviserSettings: this._adviserSettings,
            traderSettings: this._traderSettings,
            action: STATUS_STOPPED_USER,
            startedAt: this._startedAt,
            stoppedAt: this._stoppedAt
          }
        }
      };
    }
  }

  get id() {
    return this._id;
  }

  get robotId() {
    return this._robotId;
  }

  get userId() {
    return this._userId;
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

  get strategyName() {
    return this._strategyName;
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

  get adviserSettings() {
    return this._adviserSettings;
  }

  set adviserSettings(adviserSettings) {
    this._adviserSettings = { ...this._adviserSettings, ...adviserSettings };
  }

  get traderSettings() {
    return this._traderSettings;
  }

  set traderSettings(traderSettings) {
    this._traderSettings = { ...this._traderSettings, ...traderSettings };
  }

  get exwatcherId() {
    return this._exwatcherId;
  }

  set exwatcherId(exwatcherId) {
    this._exwatcherId = exwatcherId;
  }

  get exwatcherStatus() {
    return this._exwatcherStatus;
  }

  set exwatcherStatus(exwatcherStatus) {
    this._exwatcherStatus = exwatcherStatus;
    this._setStatus();
  }

  set exwatcherError(e) {
    this._exwatcherError = this._parseError(e);
    if (this._exwatcherError.critical) {
      this._exwatcherStatus = STATUS_ERROR;
      this._status = STATUS_ERROR;
    }
    this._createErrorEvent(this._exwatcherError);
  }

  get adviserId() {
    return this._adviserId;
  }

  set adviserId(adviserId) {
    this._adviserId = adviserId;
  }

  get adviserStatus() {
    return this._adviserStatus;
  }

  set adviserStatus(adviserStatus) {
    this._adviserStatus = adviserStatus;
    this._setStatus();
  }

  set adviserError(e) {
    this._adviserError = this._parseError(e);
    if (this._adviserError.critical) {
      this._adviserStatus = STATUS_ERROR;
      this._status = STATUS_ERROR;
    }
    this._createErrorEvent(this._adviserError);
  }

  get traderId() {
    return this._traderId;
  }

  set traderId(traderId) {
    this._traderId = traderId;
  }

  get traderStatus() {
    return this._traderStatus;
  }

  set traderStatus(traderStatus) {
    this._traderStatus = traderStatus;
    this._setStatus();
  }

  set traderError(e) {
    this._traderError = this._parseError(e);
    if (this._traderError.critical) {
      this._traderStatus = STATUS_ERROR;
      this._status = STATUS_ERROR;
    }
    this._createErrorEvent(this._traderError);
  }

  get status() {
    return this._status;
  }

  set status(status) {
    this._status = status;
  }

  setStarting() {
    if (this._status !== STATUS_STARTING) {
      this._status = STATUS_STARTING;
      this._events.starting = {
        eventType: TASKS_USERROBOT_HIST_EVENT,
        eventData: {
          subject: this._id,
          data: {
            id: this._id,
            candlebatcherSettings: this._candlebatcherSettings,
            adviserSettings: this._adviserSettings,
            traderSettings: this._traderSettings,
            action: STATUS_STARTING
          }
        }
      };
    }
  }

  setStopping() {
    if (this._status !== STATUS_STOPPING) {
      this._status = STATUS_STOPPING;
      this._events.starting = {
        eventType: TASKS_USERROBOT_HIST_EVENT,
        eventData: {
          subject: this._id,
          data: {
            id: this._id,
            candlebatcherSettings: this._candlebatcherSettings,
            adviserSettings: this._adviserSettings,
            traderSettings: this._traderSettings,
            action: STATUS_STOPPING
          }
        }
      };
    }
  }

  set error(error) {
    this._error = error;
    this._createErrorEvent(this._error);
  }

  get events() {
    return Object.values(this._events);
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
      eventType: TASKS_USERROBOT_HIST_EVENT,
      eventData: {
        subject: this._id,
        data: {
          id: this._id,
          candlebatcherSettings: this._candlebatcherSettings,
          adviserSettings: this._adviserSettings,
          traderSettings: this._traderSettings,
          action: error.critical ? STATUS_ERROR : STATUS_WARN,
          error
        }
      }
    };
  }

  get state() {
    return {
      PartitionKey: createRobotSlug({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        robotId: this._robotId
      }),
      RowKey: this._id,
      id: this._id,
      robotId: this._robotId,
      userId: this._userId,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      strategyName: this._strategyName,
      candlebatcherSettings: this._candlebatcherSettings,
      adviserSettings: this._adviserSettings,
      traderSettings: this._traderSettings,
      exwatcherId: this._exwatcherId,
      exwatcherStatus: this._exwatcherStatus,
      exwatcherError: this._exwatcherError,
      adviserId: this._adviserId,
      adviserStatus: this._adviserStatus,
      adviserError: this._adviserError,
      traderId: this._traderId,
      traderStatus: this._traderStatus,
      traderError: this._traderError,
      startedAt: this._startedAt,
      stoppedAt: this._stoppedAt,
      status: this._status,
      error: this._error,
      metadata: this._metadata
    };
  }
}

export default UserRobot;

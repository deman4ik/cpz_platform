import VError from "verror";
import {
  STATUS_STARTED,
  STATUS_STARTING,
  STATUS_STOPPED,
  STATUS_STOPPING,
  STATUS_PENDING,
  STATUS_ERROR,
  createRobotSlug
} from "cpzState";
import { saveUserRobotState } from "cpzStorage";

class UserRobot {
  constructor(state) {
    this._id = state.id;
    this._robotId = state.robotId;
    this._userId = state.userId;
    this._userRobotId = state.userRobotId;
    this._mode = state.mode;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._strategyName = state.strategyName;
    this._candlebatcherSettings = state.candlebatcherSettings;
    this._adviserSettings = state.adviserSettings;
    this._traderSettings = state.traderSettings;
    this._marketwatcherId = state.marketwatcherId;
    this._marketwatcherStatus = state.marketwatcherStatus;
    this._candlebatcherId = state.candlebatcherId;
    this._candlebatcherStatus = state.candlebatcherStatus;
    this._adviserId = state.adviserId;
    this._adviserStatus = state.adviserStatus;
    this._traderId = state.traderId;
    this._traderStatus = state.traderStatus;
    this._status = state.status || STATUS_STOPPED;
    this._error = state.error;
    this._metadata = state.metadata;
  }

  _setStatus() {
    if (
      this._traderStatus === STATUS_STARTED &&
      this._adviserStatus === STATUS_STARTED &&
      this._candlebatcherStatus === STATUS_STARTED &&
      this._marketwatcherStatus === STATUS_STARTED
    ) {
      this._status = STATUS_STARTED;
      this._error = null;
      return;
    }

    if (
      this._traderStatus === STATUS_STARTING ||
      this._adviserStatus === STATUS_STARTING ||
      this._candlebatcherStatus === STATUS_STARTING ||
      this._marketwatcherStatus === STATUS_STARTING
    ) {
      this._status = STATUS_STARTING;
      this._error = null;
      return;
    }

    if (
      this._traderStatus === STATUS_STOPPED ||
      this._adviserStatus === STATUS_STOPPED ||
      this._candlebatcherStatus === STATUS_STOPPED ||
      this._marketwatcherStatus === STATUS_STOPPED
    ) {
      this._status = STATUS_STOPPED;
      return;
    }

    if (
      this._traderStatus === STATUS_STOPPING ||
      this._adviserStatus === STATUS_STOPPING ||
      this._candlebatcherStatus === STATUS_STOPPING ||
      this._marketwatcherStatus === STATUS_STOPPING
    ) {
      this._status = STATUS_STOPPING;
      return;
    }

    if (
      this._traderStatus === STATUS_ERROR ||
      this._adviserStatus === STATUS_ERROR ||
      this._candlebatcherStatus === STATUS_ERROR ||
      this._marketwatcherStatus === STATUS_ERROR
    ) {
      this._status = STATUS_ERROR;
      return;
    }
    this._status = STATUS_PENDING;
  }

  get id() {
    return this._id;
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

  get adviserId() {
    return this._adviserId;
  }

  set adviserId(adviserId) {
    this._adviserId = adviserId;
  }

  set adviserStatus(adviserStatus) {
    this._adviserStatus = adviserStatus;
    this._setStatus();
  }

  set traderId(traderId) {
    this._traderId = traderId;
  }

  set candlebatcherSettings(candlebatcherSettings) {
    this._candlebatcherSettings = {
      ...this._candlebatcherSettings,
      ...candlebatcherSettings
    };
  }

  set adviserSettings(adviserSettings) {
    this._adviserSettings = { ...this._adviserSettings, ...adviserSettings };
  }

  set traderSettings(traderSettings) {
    this._traderSettings = { ...this._traderSettings, ...traderSettings };
  }

  set error(error) {
    this._error = error;
  }

  getCurrentState() {
    return {
      PartitionKey: createRobotSlug({
        exchange: this._exchange,
        asset: this._asset,
        currency: this._currency,
        timeframe: this._timeframe,
        robotId: this._robotId,
        mode: this._mode
      }),
      RowKey: this._id,
      robotId: this._robotId,
      userId: this._userId,
      mode: this._mode,
      exchange: this._exchange,
      asset: this._asset,
      currency: this._currency,
      timeframe: this._timeframe,
      strategyName: this._strategyName,
      candlebatcherSettings: this._candlebatcherSettings,
      adviserSettings: this._adviserSettings,
      traderSettings: this._traderSettings,
      marketwatcherId: this._marketwatcherId,
      marketwatcherStatus: this._marketwatcherStatus,
      candlebatcherStatus: this._candlebatcherStatus,
      adviserId: this._adviserId,
      adviserStatus: this._adviserStatus,
      traderId: this._traderId,
      traderStatus: this._traderStatus,
      status: this._status,
      error: this._error,
      metadata: this._metadata
    };
  }

  async save() {
    try {
      await saveUserRobotState(this.getCurrentState());
    } catch (error) {
      throw new VError(
        {
          name: "UserRobotError",
          cause: error,
          info: {
            id: this._id,
            robotId: this._robotId,
            userId: this._userId
          }
        },
        'Failed to save user robot "%s" state',
        this._id
      );
    }
  }
}

export default UserRobot;

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
import {
  CANDLEBATCHER_SETTINGS_DEFAULTS,
  ADVISER_SETTINGS_DEFAULTS,
  TRADER_SETTINGS_DEFAULTS
} from "cpzDefaults";

class UserRobot {
  constructor(state) {
    this._id = state.id;
    this._robotId = state.robotId;
    this._userId = state.userId;
    this._userRobotId = state.userRobotId;
    this._exchange = state.exchange;
    this._asset = state.asset;
    this._currency = state.currency;
    this._timeframe = state.timeframe;
    this._strategyName = state.strategyName;
    this._candlebatcherSettings = {
      debug:
        state.candlebatcherSettings.debug ||
        CANDLEBATCHER_SETTINGS_DEFAULTS.debug,
      proxy:
        state.candlebatcherSettings.proxy ||
        CANDLEBATCHER_SETTINGS_DEFAULTS.proxy,
      requiredHistoryMaxBars:
        state.candlebatcherSettings.requiredHistoryMaxBars ||
        CANDLEBATCHER_SETTINGS_DEFAULTS.requiredHistoryMaxBars
    };
    this._adviserSettings = {
      debug: state.adviserSettings.debug || ADVISER_SETTINGS_DEFAULTS.debug,
      strategyParameters:
        state.adviserSettings.strategyParameters ||
        ADVISER_SETTINGS_DEFAULTS.strategyParameters,
      requiredHistoryCache:
        state.adviserSettings.requiredHistoryCache ||
        ADVISER_SETTINGS_DEFAULTS.requiredHistoryCache,
      requiredHistoryMaxBars:
        state.adviserSettings.requiredHistoryMaxBars ||
        ADVISER_SETTINGS_DEFAULTS.requiredHistoryMaxBars
    };
    this._traderSettings = {
      debug: state.traderSettings.debug || TRADER_SETTINGS_DEFAULTS.debug,
      mode: state.traderSettings.mode || TRADER_SETTINGS_DEFAULTS.mode,
      slippageStep:
        state.traderSettings.slippageStep ||
        TRADER_SETTINGS_DEFAULTS.slippageStep,
      deviation:
        state.traderSettings.deviation || TRADER_SETTINGS_DEFAULTS.deviation,
      volume: state.traderSettings.volume || TRADER_SETTINGS_DEFAULTS.volume,
      openOrderTimeout:
        state.traderSettings.openOrderTimeout ||
        TRADER_SETTINGS_DEFAULTS.openOrderTimeout
    };
    this._exwatcherId = state.exwatcherId;
    this._exwatcherStatus = state.exwatcherStatus;
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
      this._exwatcherStatus === STATUS_STARTED
    ) {
      this._status = STATUS_STARTED;
      this._error = null;
      return;
    }

    if (
      this._traderStatus === STATUS_STARTING ||
      this._adviserStatus === STATUS_STARTING ||
      this._exwatcherStatus === STATUS_STARTING
    ) {
      this._status = STATUS_STARTING;
      this._error = null;
      return;
    }

    if (
      this._traderStatus === STATUS_STOPPED ||
      this._adviserStatus === STATUS_STOPPED ||
      this._exwatcherStatus === STATUS_STOPPED
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
      this._exwatcherStatus === STATUS_ERROR
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
        robotId: this._robotId
      }),
      RowKey: this._id,
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

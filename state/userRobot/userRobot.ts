import { cpz, GenericObject } from "../../@types";
import UserPosition from "./userPosition";
import { flatten } from "../../utils";
import { Errors } from "moleculer";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";

class UserRobot implements cpz.UserRobot {
  _log = console.log;
  _id: string;
  _userExAccId: string;
  _robotId: string;
  _settings: cpz.UserRobotSettings;
  _internalState: cpz.UserRobotInternalState;
  _status: cpz.Status;
  _startedAt?: string;
  _stoppedAt?: string;
  _robot: {
    exchange: string;
    asset: string;
    currency: string;
    timeframe: cpz.Timeframe;
    tradeSettings: cpz.RobotTradeSettings;
  };
  _positions: GenericObject<UserPosition>;
  _eventsToSend: cpz.Events<cpz.UserRobotEventData>[];
  _error?: any;

  constructor(state: cpz.UserRobotState) {
    this._id = state.id;
    this._userExAccId = state.userExAccId;
    this._robotId = state.robotId;
    this._settings = state.settings;
    this._status = state.status;
    this._startedAt = state.startedAt;
    this._stoppedAt = state.stoppedAt;
    this._robot = state.robot;
    this._internalState = state.internalState || {};
    this._positions = {};
    this._setPositions(state.positions);
  }

  get id() {
    return this._id;
  }

  get status() {
    return this._status;
  }

  get state() {
    return {
      userRobot: {
        id: this._id,
        userExAccId: this._userExAccId,
        robotId: this._robotId,
        settings: this._settings,
        internalState: this._internalState,
        status: this._status,
        startedAt: this._startedAt,
        stoppedAt: this._stoppedAt
      },
      positions: Object.values(this._positions).map(pos => pos.state),
      ordersToCreate: flatten(
        Object.values(this._positions).map(pos => pos.ordersToCreate)
      ),
      ordersWithJobs: flatten(
        Object.values(this._positions).map(pos => pos.orderWithJobs)
      ),
      eventsToSend: this._eventsToSend
    };
  }

  get positions() {
    return Object.values(this._positions).map(pos => pos.state);
  }

  get hasActivePositions() {
    return (
      Object.values(this._positions).filter(
        pos =>
          pos.status === cpz.UserPositionStatus.new ||
          pos.status === cpz.UserPositionStatus.open
      ).length > 0
    );
  }

  _setPositions(positions: cpz.UserPositionState[]) {
    if (positions && Array.isArray(positions) && positions.length > 0) {
      positions.forEach(position => {
        this._positions[position.positionId] = new UserPosition(position);
        this._positions[position.positionId]._log = this._log.bind(this);
      });
    }
  }

  _getNextPositionCode(prefix: string) {
    if (!this._internalState.posLastNumb) this._internalState.posLastNumb = {};
    if (
      Object.prototype.hasOwnProperty.call(
        this._internalState.posLastNumb,
        prefix
      )
    ) {
      this._internalState.posLastNumb[prefix] += 1;
    } else {
      this._internalState.posLastNumb[prefix] = 1;
    }
    return `${prefix}_${this._internalState.posLastNumb[prefix]}`;
  }

  stop() {
    this._status = cpz.Status.stopping;
    if (this.hasActivePositions)
      Object.keys(this._positions).forEach(key => {
        this._positions[key].cancel();
        this._positions[key].executeJob();
      });
    else this.setStop();
  }

  setStop() {
    this._status = cpz.Status.stopped;
    this._stoppedAt = dayjs.utc().toISOString();
    this._error = null;
    this._eventsToSend.push({
      type: cpz.Event.USER_ROBOT_STOPPED,
      data: {
        userRobotId: this._id
      }
    });
  }

  update(settings: cpz.UserRobotSettings) {
    this._settings = { ...this._settings, ...settings };
    this._eventsToSend.push({
      type: cpz.Event.USER_ROBOT_UPDATED,
      data: {
        userRobotId: this._id
      }
    });
  }

  pause() {
    this._status = cpz.Status.paused;
    this._eventsToSend.push({
      type: cpz.Event.USER_ROBOT_PAUSED,
      data: {
        userRobotId: this._id
      }
    });
  }

  handleSignal(signal: cpz.SignalEvent) {
    if (signal.robotId !== this._robotId)
      throw new Errors.MoleculerError("Wrong robot id", 400, "ERR_WRONG", {
        signal,
        robotId: this._robotId,
        userRobotId: this._id
      });
    if (
      this._internalState.latestSignal &&
      this._internalState.latestSignal.id === signal.id
    ) {
      throw new Errors.MoleculerError(
        "Signal already handled",
        409,
        "ERR_CONFLICT",
        { signal, userRobotId: this._id }
      );
    }

    //TODO: check parentId

    if (
      signal.action === cpz.TradeAction.long ||
      signal.action === cpz.TradeAction.short
    ) {
      this._positions[signal.positionId] = new UserPosition({
        id: uuid(),
        prefix: signal.positionPrefix,
        code: this._getNextPositionCode(signal.positionPrefix),
        positionId: signal.positionId,
        userRobotId: this._id,
        status: cpz.UserPositionStatus.new,
        parentId: signal.positionParentId,
        direction:
          signal.action === cpz.TradeAction.long
            ? cpz.PositionDirection.long
            : cpz.PositionDirection.short,
        robot: this._robot,
        userRobot: {
          userExAccId: this._userExAccId,
          settings: this._settings
        },
        internalState: {
          entrySlippageCount: 0,
          exitSlippageCount: 0
        }
      });
    } else {
      if (!this._positions[signal.positionId])
        throw new Errors.MoleculerError(
          "Active position not found",
          404,
          "ERR_NOT_FOUND",
          {
            signal,
            userRobotId: this._id
          }
        );
    }

    this._positions[signal.positionId].handleSignal(signal);
    this._positions[signal.positionId].executeJob();
  }

  handleOrder(order: cpz.Order) {
    if (order.userRobotId !== this._id)
      throw new Errors.MoleculerError("Wrong user robot id", 400, "ERR_WRONG", {
        order,
        userRobotId: this._id
      });

    if (!this._positions[order.positionId])
      throw new Errors.MoleculerError(
        "Position not found",
        404,
        "ERR_NOT_FOUND",
        {
          order,
          userRobotId: this._id
        }
      );

    this._positions[order.positionId].handleOrder(order);
    this._positions[order.positionId].executeJob();
  }
}

export = UserRobot;

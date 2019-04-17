import ServiceError from "cpz/error";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPING,
  STATUS_STOPPED
} from "cpz/config/state";
import {
  getUserRobotById,
  saveUserRobotState,
  deleteUserRobotState
} from "cpz/tableStorage-client/control/userRobots";
import {
  USER_ROBOT_START,
  USER_ROBOT_STOP,
  USER_ROBOT_UPDATE,
  TASKS_EXWATCHER_STARTED_EVENT,
  TASKS_EXWATCHER_STOPPED_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOPPED_EVENT
} from "cpz/events/types/tasks";
import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import BaseRunner from "../baseRunner";
import UserRobot from "./userRobot";
import TraderRunner from "../services/traderRunner";
import AdviserRunner from "../services/adviserRunner";
import ExWatcherRunner from "./exwatcherRunner";
import publishEvents from "../../utils/publishEvents";

class UserRobotRunner extends BaseRunner {
  static async create(robotParams) {
    try {
      ServiceValidator.check(USER_ROBOT_START, robotParams);
      const userRobotState = await getUserRobotById(robotParams.id);
      if (userRobotState) {
        if (
          userRobotState.status === STATUS_STARTED ||
          userRobotState.status === STATUS_STARTING
        ) {
          return {
            id: userRobotState.id,
            status: userRobotState.status
          };
        }

        await deleteUserRobotState(userRobotState);
      }

      return await UserRobotRunner.start(robotParams);
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.USER_ROBOT_RUNNER_ERROR,
          cause: e,
          info: robotParams
        },
        "Failed to create User Robot"
      );
      Log.error(error);
      throw error;
    }
  }

  static async getState(taskId) {
    try {
      const state = await getUserRobotById(taskId);
      if (!state)
        throw new ServiceError(
          {
            name: ServiceError.types.USER_ROBOT_NOT_FOUND_ERROR,
            info: { taskId }
          },
          "Failed to load User Robot state."
        );
      return state;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.USER_ROBOT_RUNNER_ERROR,
          cause: e,
          info: { taskId }
        },
        "Failed to get User Robot state."
      );
      Log.error(error);
      throw error;
    }
  }

  static async handleAction(action) {
    try {
      const { type, taskId, data } = action;
      const state = await UserRobotRunner.getState(taskId);

      if (type === "event") {
        UserRobotRunner.handleEvent(state, data);
      } else if (type === "start") {
        UserRobotRunner.start(state);
      } else if (type === "stop") {
        UserRobotRunner.stop(state);
      } else if (type === "update") {
        UserRobotRunner.update(state, data);
      } else {
        Log.error(`Unknown User Robot action type - ${type}`);
      }
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.USER_ROBOT_RUNNER_ERROR,
          cause: e,
          info: { action }
        },
        "Failed to handle action with User Robot"
      );
      Log.error(error);
      throw error;
    }
  }

  static async handleEvent(state, event) {
    try {
      const userRobot = new UserRobot(state);
      const { eventType } = event;

      // Exwatcher
      if (eventType === TASKS_EXWATCHER_STARTED_EVENT) {
        userRobot.exwatcherStatus = STATUS_STARTED;
      } else if (eventType === TASKS_EXWATCHER_STOPPED_EVENT) {
        userRobot.exwatcherStatus = STATUS_STOPPED;
      }

      // Adviser
      else if (eventType === TASKS_ADVISER_STARTED_EVENT) {
        userRobot.adviserStatus = STATUS_STARTED;
      } else if (eventType === TASKS_ADVISER_STOPPED_EVENT) {
        userRobot.adviserStatus = STATUS_STOPPED;
      }

      // Trader
      else if (eventType === TASKS_TRADER_STARTED_EVENT) {
        userRobot.traderStatus = STATUS_STARTED;
      } else if (eventType === TASKS_TRADER_STOPPED_EVENT) {
        userRobot.traderStatus = STATUS_STOPPED;
      }

      // TODO: Handle Error events

      await saveUserRobotState(userRobot.state);
      await publishEvents(userRobot.events);

      if (userRobot.status === STATUS_STARTING) {
        UserRobotRunner.start(userRobot.state);
      }
      if (userRobot.status === STATUS_STOPPING) {
        UserRobotRunner.stop(userRobot.state);
      }
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.USER_ROBOT_RUNNER_ERROR,
          cause: e,
          info: { ...state }
        },
        "Failed to handle service event with User Robot."
      );
      Log.error(error);
      throw error;
    }
  }

  static async start(state) {
    try {
      if (state.status === STATUS_STARTED)
        return {
          id: state.id,
          status: STATUS_STARTED
        };
      const userRobot = new UserRobot(state);
      userRobot.status = STATUS_STARTING;
      userRobot.log("start");
      const events = [];
      if (userRobot.exwatcherStatus !== STATUS_STARTED) {
        userRobot.log("ExWatcher!");
        const exwatcherParams = {
          exchange: userRobot.exchange,
          asset: userRobot.asset,
          currency: userRobot.currency,
          candlebatcherSettings: userRobot.candlebatcherSettings
        };

        const { taskId, status } = await ExWatcherRunner.create(
          exwatcherParams
        );
        userRobot.exwatcherId = taskId;
        userRobot.exwatcherStatus = status;
      }

      if (
        userRobot.exwatcherStatus === STATUS_STARTED &&
        userRobot.traderStatus !== STATUS_STARTED &&
        userRobot.traderStatus !== STATUS_STARTING
      ) {
        userRobot.log("Trader!");
        const traderParams = {
          taskId: userRobot.id,
          robotId: userRobot.robotId,
          userId: userRobot.userId,
          exchange: userRobot.exchange,
          asset: userRobot.asset,
          currency: userRobot.currency,
          timeframe: userRobot.timeframe,
          settings: userRobot.traderSettings
        };

        const { taskId, status, event } = await TraderRunner.start(
          traderParams
        );
        userRobot.traderId = taskId;
        userRobot.traderStatus = status;
        events.push(event);
      }

      if (
        userRobot.traderStatus === STATUS_STARTED &&
        userRobot.adviserStatus !== STATUS_STARTED &&
        userRobot.adviserStatus !== STATUS_STARTING
      ) {
        userRobot.log("Adviser!");
        const adviserParams = {
          taskId: userRobot.robotId.toString(),
          robotId: userRobot.robotId,
          exchange: userRobot.exchange,
          asset: userRobot.asset,
          currency: userRobot.currency,
          timeframe: userRobot.timeframe,
          strategyName: userRobot.strategyName,
          settings: userRobot.adviserSettings
        };

        const { taskId, status, event } = await AdviserRunner.start(
          adviserParams
        );
        userRobot.adviserId = taskId;
        userRobot.adviserStatus = status;
        events.push(event);
      }

      await saveUserRobotState(userRobot.state);
      await publishEvents([...userRobot.events, ...events]);
      return {
        id: userRobot.id,
        status: userRobot.status
      };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.USER_ROBOT_RUNNER_ERROR,
          cause: e,
          info: state
        },
        "Failed to start User Robot"
      );
      Log.error(error);
      throw error;
    }
  }

  static async stop(state) {
    try {
      ServiceValidator.check(USER_ROBOT_STOP, state);

      if (state.status === STATUS_STOPPED)
        return {
          id: state.id,
          status: STATUS_STOPPED
        };
      const userRobot = new UserRobot(state);
      userRobot.status = STATUS_STOPPING;
      userRobot.log("stop");
      const events = [];
      if (
        userRobot.traderId &&
        (userRobot.traderStatus !== STATUS_STOPPED ||
          userRobot.traderStatus !== STATUS_STOPPING)
      ) {
        const { taskId, status, event } = await TraderRunner.stop({
          taskId: userRobot.traderId
        });
        userRobot.traderId = taskId;
        userRobot.traderStatus = status;
        events.push(event);
      }

      if (
        userRobot.adviserId &&
        (userRobot.adviserStatus !== STATUS_STOPPED ||
          userRobot.adviserStatus !== STATUS_STOPPING)
      ) {
        const { taskId, status, event } = await AdviserRunner.stop({
          taskId: userRobot.adviserId,
          userRobotId: userRobot.id
        });
        userRobot.adviserId = taskId;
        userRobot.adviserStatus = status;
        events.push(event);
      }

      await saveUserRobotState(userRobot.state);
      await publishEvents([...userRobot.events, ...events]);

      return { id: userRobot.id, status: userRobot.status };
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.USER_ROBOT_RUNNER_ERROR,
          cause: e,
          info: state
        },
        "Failed to stop User Robot"
      );
      Log.error(error);
      throw error;
    }
  }

  static async update(state, settings) {
    try {
      ServiceValidator.check(USER_ROBOT_UPDATE, settings);

      const userRobot = new UserRobot(state);
      userRobot.log("update");
      const events = [];
      if (userRobot.traderSettings) {
        userRobot.traderSettings = {
          ...userRobot.traderSettings,
          ...settings.traderSettings
        };
        const { event } = await TraderRunner.update({
          taskId: userRobot.traderId,
          settings: userRobot.traderSettings
        });
        events.push(event);
      }
      await saveUserRobotState(userRobot.state);
      await publishEvents(events);
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.USER_ROBOT_RUNNER_ERROR,
          cause: e,
          info: state
        },
        "Failed to update User Robot"
      );
      Log.error(error);
      throw error;
    }
  }
}

export default UserRobotRunner;

import VError from "verror";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPING,
  STATUS_STOPPED
} from "cpzState";
import { getUserRobotById, deleteUserRobotState } from "cpzStorage/userRobots";
import {
  USER_ROBOT_START_PARAMS,
  USER_ROBOT_STOP_PARAMS,
  USER_ROBOT_UPDATE_PARAMS
} from "cpzEventTypes";
import Log from "cpzLog";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import BaseRunner from "../baseRunner";
import UserRobot from "./userRobot";
import TraderRunner from "../services/traderRunner";
import AdviserRunner from "../services/adviserRunner";
import ExWatcherRunner from "./exwatcherRunner";

const validateStart = createValidator(USER_ROBOT_START_PARAMS);
const validateStop = createValidator(USER_ROBOT_STOP_PARAMS);
const validateUpdate = createValidator(USER_ROBOT_UPDATE_PARAMS);

class UserRobotRunner extends BaseRunner {
  static async create(context, robotParams) {
    try {
      genErrorIfExist(validateStart(robotParams));
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

      return await UserRobotRunner.start(context, robotParams);
    } catch (error) {
      const err = new VError(
        {
          name: "RobotRunnerError",
          cause: error,
          info: robotParams
        },
        "Failed to create robot"
      );
      Log.error(err);
      throw err;
    }
  }

  static async start(context, robotParams) {
    try {
      let userRobotState = robotParams;
      const userRobot = new UserRobot(context, userRobotState);
      userRobot.log("start");
      if (userRobot.status === STATUS_STARTED) {
        return {
          id: userRobot.id,
          status: STATUS_STARTED
        };
      }
      userRobotState = userRobot.getCurrentState();

      if (userRobotState.exwatcherStatus !== STATUS_STARTED) {
        userRobot.log("ExWatcher!");
        const exwatcherParams = {
          exchange: userRobotState.exchange,
          asset: userRobotState.asset,
          currency: userRobotState.currency,
          candlebatcherSettings: userRobotState.candlebatcherSettings
        };

        const result = await ExWatcherRunner.create(context, exwatcherParams);
        userRobot.exwatcherId = result.taskId;
        userRobot.exwatcherStatus = result.status;
        await userRobot.save();
        userRobotState = userRobot.getCurrentState();
      }

      if (
        userRobotState.exwatcherStatus === STATUS_STARTED &&
        userRobotState.traderStatus !== STATUS_STARTED &&
        userRobotState.traderStatus !== STATUS_STARTING
      ) {
        userRobot.log("Trader!");
        const traderParams = {
          robotId: userRobotState.robotId,
          userId: userRobotState.userId,
          exchange: userRobotState.exchange,
          asset: userRobotState.asset,
          currency: userRobotState.currency,
          timeframe: userRobotState.timeframe,
          settings: userRobotState.traderSettings
        };

        const result = await TraderRunner.start(context, traderParams);
        userRobot.traderId = result.taskId;
        userRobot.traderStatus = result.status;
        await userRobot.save();
        userRobotState = userRobot.getCurrentState();
      }

      if (
        userRobotState.traderStatus === STATUS_STARTED &&
        userRobotState.adviserStatus !== STATUS_STARTED &&
        userRobotState.adviserStatus !== STATUS_STARTING
      ) {
        userRobot.log("Adviser!");
        const adviserParams = {
          robotId: userRobotState.robotId,
          exchange: userRobotState.exchange,
          asset: userRobotState.asset,
          currency: userRobotState.currency,
          timeframe: userRobotState.timeframe,
          strategyName: userRobotState.strategyName,
          settings: userRobotState.adviserSettings
        };

        const result = await AdviserRunner.start(context, adviserParams);
        userRobot.adviserId = result.taskId;
        userRobot.adviserStatus = result.status;
        await userRobot.save();
        userRobotState = userRobot.getCurrentState();
      }

      return {
        id: userRobot.id,
        status: userRobot.status
      };
    } catch (error) {
      const err = new VError(
        {
          name: "RobotRunnerError",
          cause: error,
          info: robotParams
        },
        "Failed to start robot"
      );
      Log.error(err);
      throw err;
    }
  }

  static async stop(context, robotParams) {
    try {
      genErrorIfExist(validateStop(robotParams));
      const userRobotState = await getUserRobotById(robotParams.id);
      if (!userRobotState) throw new Error("RobotNotFound");
      const userRobot = new UserRobot(context, userRobotState);
      userRobot.log("stop");
      if (userRobot.status === STATUS_STOPPED)
        return {
          id: userRobot.id,
          status: STATUS_STOPPED
        };

      if (
        userRobotState.traderId &&
        (userRobotState.traderStatus !== STATUS_STOPPED ||
          userRobotState.traderStatus !== STATUS_STOPPING)
      ) {
        const result = await TraderRunner.stop(context, {
          taskId: userRobotState.traderId
        });
        userRobot.traderId = result.taskId;
        userRobot.traderStatus = result.status;
      }

      if (
        userRobotState.adviserId &&
        (userRobotState.adviserStatus !== STATUS_STOPPED ||
          userRobotState.adviserStatus !== STATUS_STOPPING)
      ) {
        const result = await AdviserRunner.stop(context, {
          taskId: userRobotState.adviserId,
          userRobotId: userRobot.id
        });
        userRobot.adviserId = result.taskId;
        userRobot.adviserStatus = result.status;
      }

      await userRobot.save();

      return { id: userRobot.id, status: userRobot.status };
    } catch (error) {
      const err = new VError(
        {
          name: "RobotRunnerError",
          cause: error,
          info: robotParams
        },
        "Failed to stop robot"
      );
      Log.error(err);
      throw err;
    }
  }

  static async update(context, robotParams) {
    try {
      genErrorIfExist(validateUpdate(robotParams));
      const userRobotState = await getUserRobotById(robotParams.id);
      if (!userRobotState) throw new Error("RobotNotFound");
      const userRobot = new UserRobot(context, userRobotState);
      userRobot.log("update");
      if (robotParams.traderSettings) {
        userRobot.traderSettings = robotParams.traderSettings;
        await TraderRunner.update(context, {
          taskId: userRobotState.traderId,
          settings: robotParams.traderSettings
        });
      }

      await userRobot.save();
    } catch (error) {
      const err = new VError(
        {
          name: "RobotRunnerError",
          cause: error,
          info: robotParams
        },
        "Failed to update robot"
      );
      Log.error(err);
      throw err;
    }
  }
}

export default UserRobotRunner;

import VError from "verror";
import {
  STATUS_STARTING,
  STATUS_STARTED,
  STATUS_STOPPING,
  STATUS_STOPPED
} from "cpzState";
import { getUserRobotById } from "cpzStorage";
import {
  USER_ROBOT_START_PARAMS,
  USER_ROBOT_STOP_PARAMS,
  USER_ROBOT_UPDATE_PARAMS
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import BaseRunner from "./baseRunner";
import UserRobot from "./userrobot";
import TraderRunner from "./services/traderRunner";
import AdviserRunner from "./services/adviserRunner";
import ExWatcherRunner from "./exwatcherRunner";

const validateStart = createValidator(USER_ROBOT_START_PARAMS);
const validateStop = createValidator(USER_ROBOT_STOP_PARAMS);
const validateUpdate = createValidator(USER_ROBOT_UPDATE_PARAMS);

class RobotRunner extends BaseRunner {
  static async start(robotParams) {
    try {
      genErrorIfExist(validateStart(robotParams));
      let userRobotState = robotParams;
      const userRobot = new UserRobot(userRobotState);
      if (userRobot.status === STATUS_STARTED) {
        return {
          id: userRobot.id,
          status: STATUS_STARTED
        };
      }
      userRobotState = userRobot.getCurrentState();

      if (userRobotState.exwatcherStatus !== STATUS_STARTED) {
        const exwatcherParams = {
          exchange: userRobotState.exchange,
          asset: userRobotState.asset,
          currency: userRobotState.currency,
          candlebatcherSettings: userRobotState.candlebatcherSettings
        };

        const result = await ExWatcherRunner.start(exwatcherParams);
        userRobot.exwatcherId = result.taskId;
        userRobot.exwatcherStatus = result.status;
        await userRobot.save();
        userRobotState = userRobot.getCurrentState();
      }

      if (
        userRobotState.exwatcherStatus === STATUS_STARTED &&
        userRobotState.adviserStatus !== STATUS_STARTED &&
        userRobotState.adviserStatus !== STATUS_STARTING
      ) {
        const adviserParams = {
          robotId: userRobotState.robotId,
          exchange: userRobotState.exchange,
          asset: userRobotState.asset,
          currency: userRobotState.currency,
          timeframe: userRobotState.timeframe,
          strategyName: userRobotState.strategyName,
          settings: userRobotState.adviserSettings
        };

        const result = AdviserRunner.start(adviserParams);
        userRobot.adviserId = result.taskId;
        userRobot.adviserStatus = result.status;
        await userRobot.save();
        userRobotState = userRobot.getCurrentState();
      }

      if (
        userRobotState.exwatcherStatus === STATUS_STARTED &&
        userRobotState.adviserStatus === STATUS_STARTED &&
        userRobotState.traderStatus !== STATUS_STARTED &&
        userRobotState.traderStatus !== STATUS_STARTING
      ) {
        const traderParams = {
          robotId: userRobotState.robotId,
          userId: userRobotState.userId,
          adviserId: userRobotState.adviserId,
          exchange: userRobotState.exchange,
          asset: userRobotState.asset,
          currency: userRobotState.currency,
          timeframe: userRobotState.timeframe,
          settings: userRobotState.traderSettings
        };

        const result = await TraderRunner.start(traderParams);
        userRobot.traderId = result.taskId;
        userRobot.traderStatus = result.status;
        await userRobot.save();
        userRobotState = userRobot.getCurrentState();
      }

      return {
        id: userRobot.id,
        status: userRobot.status
      };
    } catch (error) {
      throw new VError(
        {
          name: "RobotRunnerError",
          cause: error,
          info: robotParams
        },
        "Failed to start robot"
      );
    }
  }

  static async stop(robotParams) {
    try {
      genErrorIfExist(validateStop(robotParams));
      const userRobotState = getUserRobotById(robotParams.id);
      if (!userRobotState) throw new Error("RobotNotFound");
      const userRobot = new UserRobot(userRobotState);
      if (userRobot.status === STATUS_STOPPED)
        return {
          id: userRobot.id,
          status: STATUS_STOPPED
        };

      if (
        userRobotState.traderStatus !== STATUS_STOPPED ||
        userRobotState.traderStatus !== STATUS_STOPPING
      ) {
        const result = await TraderRunner.stop({
          taskId: userRobotState.traderId
        });
        userRobot.traderId = result.taskId;
        userRobot.traderStatus = result.status;
      }

      if (
        userRobotState.adviserStatus !== STATUS_STOPPED ||
        userRobotState.adviserStatus !== STATUS_STOPPING
      ) {
        const result = await AdviserRunner.stop({
          taskId: userRobotState.adviserId,
          userRobotId: userRobot.id
        });
        userRobot.adviserId = result.taskId;
        userRobot.adviserStatus = result.status;
      }

      await userRobot.save();

      return { id: userRobot.id, status: userRobot.status };
    } catch (error) {
      throw new VError(
        {
          name: "RobotRunnerError",
          cause: error,
          info: robotParams
        },
        "Failed to stop robot"
      );
    }
  }

  static async update(robotParams) {
    try {
      genErrorIfExist(validateUpdate(robotParams));
      const userRobotState = getUserRobotById(robotParams.id);
      if (!userRobotState) throw new Error("RobotNotFound");
      const userRobot = new UserRobot(userRobotState);

      if (robotParams.traderSettings) {
        userRobot.traderSettings = robotParams.traderSettings;
        await TraderRunner.update({
          taskId: userRobotState.traderId,
          settings: robotParams.traderSettings
        });
      }

      await userRobot.save();
    } catch (error) {
      throw new VError(
        {
          name: "RobotRunnerError",
          cause: error,
          info: robotParams
        },
        "Failed to update robot"
      );
    }
  }
}

export default RobotRunner;

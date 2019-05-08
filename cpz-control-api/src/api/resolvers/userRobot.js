import ServiceError from "cpz/error";
import Log from "cpz/log";
import { getUserRobotDB } from "cpz/db-client/userRobots";
import EventHub from "cpz/eventhub-client";
import { STATUS_STOPPED, STATUS_STOPPING } from "cpz/config/state";
import { USERROBOT_SERVICE } from "cpz/config/services";
import UserRobotRunner from "../../taskrunner/tasks/userRobotRunner";

async function startUserRobot(_, { userRobotId, overrideParams }) {
  try {
    const userRobot = await getUserRobotDB(userRobotId);
    if (!userRobot)
      return {
        success: false,
        error: {
          name: ServiceError.types.USER_ROBOT_RUNNER_ERROR,
          message: `User Robot ${userRobotId} not found`,
          info: {
            userRobotId
          }
        }
      };
    const userRobotParams = {
      ...userRobot,
      ...overrideParams
    };
    const { status } = await UserRobotRunner.create(userRobotParams);
    return {
      success: true,
      taskId: userRobotId,
      status
    };
  } catch (e) {
    let error;
    if (e instanceof ServiceError) {
      error = e;
    } else {
      error = new ServiceError(
        {
          name: ServiceError.types.CONTROL_ERROR,
          cause: e
        },
        "Failed to process request"
      );
    }
    Log.clearContext();
    return {
      success: false,
      error: error.json
    };
  }
}

async function stopUserRobot(_, { userRobotId }) {
  try {
    const state = await UserRobotRunner.getState(userRobotId);
    const result = { success: true, taskId: userRobotId };
    if (
      state &&
      (state.status === STATUS_STOPPED || state.status === STATUS_STOPPING)
    ) {
      result.status = state.status;
    } else {
      await EventHub.send(userRobotId, {
        taskId: userRobotId,
        type: "stop",
        service: USERROBOT_SERVICE
      });
      result.status = STATUS_STOPPING;
    }
    Log.clearContext();
    return result;
  } catch (e) {
    let error;
    if (e instanceof ServiceError) {
      error = e;
    } else {
      error = new ServiceError(
        {
          name: ServiceError.types.CONTROL_ERROR,
          cause: e
        },
        "Failed to process request"
      );
    }
    Log.clearContext();
    return {
      success: false,
      error: error.json
    };
  }
}

async function updateUserRobot(_, { userRobotId, params }) {
  try {
    const state = await UserRobotRunner.getState(userRobotId);
    let result = { success: true, taskId: userRobotId };
    if (
      state &&
      (state.status === STATUS_STOPPED || state.status === STATUS_STOPPING)
    ) {
      result = {
        success: true,
        taskId: userRobotId,
        status: state.status
      };
    } else {
      await EventHub.send(userRobotId, {
        taskId: userRobotId,
        type: "update",
        service: USERROBOT_SERVICE,
        data: params
      });
    }
    Log.clearContext();
    return result;
  } catch (e) {
    let error;
    if (e instanceof ServiceError) {
      error = e;
    } else {
      error = new ServiceError(
        {
          name: ServiceError.types.CONTROL_ERROR,
          cause: e
        },
        "Failed to process request"
      );
    }
    Log.clearContext();
    return {
      success: false,
      error: error.json
    };
  }
}

export { startUserRobot, stopUserRobot, updateUserRobot };

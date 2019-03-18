import { getUserRobotDB } from "cpz/db";
import { createErrorOutput } from "cpz/utils/error";
import UserRobotRunner from "../../taskrunner/tasks/userRobotRunner";

async function startUserRobot(_, { userRobotId, overrideParams }, { context }) {
  try {
    const userRobot = await getUserRobotDB(userRobotId);
    if (!userRobot)
      return {
        success: false,
        error: {
          name: "RobotRunnerError",
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
    const { status } = await UserRobotRunner.create(context, userRobotParams);
    return {
      success: true,
      taskId: userRobotId,
      status
    };
  } catch (error) {
    const errorOutput = createErrorOutput(error);
    return {
      success: false,
      error: {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      }
    };
  }
}

async function stopUserRobot(_, { userRobotId }, { context }) {
  try {
    const { status } = await UserRobotRunner.stop(context, { id: userRobotId });
    return {
      success: true,
      taskId: userRobotId,
      status
    };
  } catch (error) {
    const errorOutput = createErrorOutput(error);
    return {
      success: false,
      error: {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      }
    };
  }
}

async function updateUserRobot(_, { userRobotId, params }, { context }) {
  try {
    await UserRobotRunner.update(context, { id: userRobotId, ...params });
    return {
      success: true
    };
  } catch (error) {
    const errorOutput = createErrorOutput(error);
    return {
      success: false,
      error: {
        name: errorOutput.name,
        message: errorOutput.message,
        info: errorOutput.info
      }
    };
  }
}

export { startUserRobot, stopUserRobot, updateUserRobot };

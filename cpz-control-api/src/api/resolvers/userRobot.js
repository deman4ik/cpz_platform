import { getUserRobotDB } from "cpzDB";
import { createErrorOutput } from "cpzUtils/error";
import UserRobotRunner from "../../taskrunner/tasks/userRobotRunner";

async function startUserRobot(_, { userRobotId }, { context }) {
  try {
    const userRobot = await getUserRobotDB(userRobotId);
    context.log(userRobot);
    const { status } = await UserRobotRunner.start(context, userRobot);
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
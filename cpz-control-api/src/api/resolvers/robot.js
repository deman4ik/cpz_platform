import { getUserRobotDB } from "cpzDB";
import { createErrorOutput } from "cpzUtils/error";
import RobotRunner from "../../taskrunner/robotRunner";

async function startRobot(_, { userRobotId }, { context }) {
  try {
    const userRobot = await getUserRobotDB(userRobotId);
    context.log(userRobot);
    const { status } = await RobotRunner.start(context, userRobot);
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

async function stopRobot(_, { userRobotId }, { context }) {
  try {
    const { status } = await RobotRunner.stop(context, { id: userRobotId });
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

async function updateRobot(_, { userRobotId, params }, { context }) {
  try {
    await RobotRunner.update(context, { id: userRobotId, ...params });
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

export { startRobot, stopRobot, updateRobot };

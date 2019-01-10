import { getUserRobotDB } from "cpzDB";
import RobotRunner from "../../taskrunner/robotRunner";

async function startRobot(_, { params }, { context }) {
  try {
    const userRobot = getUserRobotDB(params);
    const { id, status } = await RobotRunner.start(context, userRobot);
    return {
      success: true,
      taskId: id,
      status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function stopRobot(_, { id }, { context }) {
  try {
    const { status } = await RobotRunner.stop(context, { id });
    return {
      success: true,
      taskId: id,
      status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function updateRobot(_, { id, params }, { context }) {
  try {
    await RobotRunner.update(context, { id, ...params });
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export { startRobot, stopRobot, updateRobot };

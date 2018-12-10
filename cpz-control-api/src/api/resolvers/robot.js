import RobotRunner from "../../taskrunner/robotRunner";
import DB from "cpzDB";

const db = new DB();

async function startRobot(_, { params }, { dataSources }) {
  try {
    const userRobot = db.getUserRobot(params);
    const { taskId, status } = await RobotRunner.start(userRobot);
    return {
      success: true,
      taskId,
      status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function stopRobot(_, { id }, { dataSources }) {
  try {
    // TODO: Update robot status in DB
    const { status } = await RobotRunner.stop(id);
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

async function updateRobot(_, { params }, { dataSources }) {
  try {
    await RobotRunner.update(params);
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

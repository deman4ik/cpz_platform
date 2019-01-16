import { createErrorOutput } from "cpzUtils/error";
import AdviserRunner from "../../taskrunner/services/adviserRunner";

async function startAdviserService(_, { params }, { context }) {
  try {
    const { taskId, status } = await AdviserRunner.start(context, params);
    return {
      success: true,
      taskId,
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

async function stopAdviserService(_, { taskId }, { context }) {
  try {
    const { status } = await AdviserRunner.stop(context, { taskId });
    return {
      success: true,
      taskId,
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

async function updateAdviserService(_, { params }, { context }) {
  try {
    await AdviserRunner.update(context, params);
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

export { startAdviserService, stopAdviserService, updateAdviserService };

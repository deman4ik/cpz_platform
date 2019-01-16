import { createErrorOutput } from "cpzUtils/error";
import TraderRunner from "../../taskrunner/services/traderRunner";

async function startTraderService(_, { params }, { context }) {
  try {
    const { taskId, status } = await TraderRunner.start(context, params);
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

async function stopTraderService(_, { taskId }, { context }) {
  try {
    const { status } = await TraderRunner.stop(context, { taskId });
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

async function updateTraderService(_, { params }, { context }) {
  try {
    await TraderRunner.update(context, params);
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

export { startTraderService, stopTraderService, updateTraderService };

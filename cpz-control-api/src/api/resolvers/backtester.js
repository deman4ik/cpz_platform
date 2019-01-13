import { createErrorOutput } from "cpzUtils/error";
import BacktesterRunner from "../../taskrunner/services/backtesterRunner";

async function startBacktester(_, { params }, { context }) {
  try {
    const { taskId, status } = await BacktesterRunner.start(context, params);
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

async function stopBacktester(_, { taskId }, { context }) {
  try {
    const { status } = await BacktesterRunner.stop(context, { taskId });
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

export { startBacktester, stopBacktester };

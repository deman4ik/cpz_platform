import { getRobotDB } from "cpzDB";
import { createErrorOutput } from "cpzUtils/error";
import BacktestRunner from "../../taskrunner/tasks/backtestRunner";

async function startBacktest(_, { params }, { context }) {
  try {
    const robot = await getRobotDB(params.robotId);
    const backtestParams = {
      ...robot,
      ...params
    };
    const { taskId, status } = await BacktestRunner.start(
      context,
      backtestParams
    );
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

async function stopBacktest(_, { taskId }, { context }) {
  try {
    const { status } = await BacktestRunner.stop(context, { taskId });
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

export { startBacktest, stopBacktest };

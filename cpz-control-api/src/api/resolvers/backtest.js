import { getRobotDB } from "cpzDB";
import { createErrorOutput } from "cpzUtils/error";
import BacktestRunner from "../../taskrunner/tasks/backtestRunner";

async function startBacktest(
  _,
  { robotId, backtesterId, overrideParams },
  { context }
) {
  try {
    const robot = await getRobotDB(robotId);
    const backtestParams = {
      ...robot,
      backtesterId,
      ...overrideParams
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

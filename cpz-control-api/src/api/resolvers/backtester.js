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
    return {
      success: false,
      error: error.message
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
    return {
      success: false,
      error: error.message
    };
  }
}

export { startBacktester, stopBacktester };

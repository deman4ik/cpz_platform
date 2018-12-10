import BacktesterRunner from "../../taskrunner/services/backtesterRunner";

async function startBacktester(_, { params }) {
  try {
    const { taskId, status } = await BacktesterRunner.start(params);
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

async function stopBacktester(_, { taskId }) {
  try {
    const { status } = await BacktesterRunner.stop({ taskId });
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

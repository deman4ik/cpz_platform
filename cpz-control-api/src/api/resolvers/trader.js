import TraderRunner from "../../taskrunner/services/traderRunner";

async function startTrader(_, { params }) {
  try {
    const { taskId, status } = await TraderRunner.start(params);
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

async function stopTrader(_, { taskId }) {
  try {
    const { status } = await TraderRunner.stop({ taskId });
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

async function updateTrader(_, { params }) {
  try {
    await TraderRunner.update(params);
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

export { startTrader, stopTrader, updateTrader };

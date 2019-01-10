import TraderRunner from "../../taskrunner/services/traderRunner";

async function startTrader(_, { params }, { context }) {
  try {
    const { taskId, status } = await TraderRunner.start(context, params);
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

async function stopTrader(_, { taskId }, { context }) {
  try {
    const { status } = await TraderRunner.stop(context, { taskId });
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

async function updateTrader(_, { params }, { context }) {
  try {
    await TraderRunner.update(context, params);
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

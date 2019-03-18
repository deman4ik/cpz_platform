import { createErrorOutput } from "cpz/utils/error";
import MarketwatcherRunner from "../../taskrunner/services/marketwatcherRunner";

async function startMarketwatcherService(_, { params }, { context }) {
  try {
    const { taskId, status } = await MarketwatcherRunner.start(context, params);
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

async function stopMarketwatcherService(_, { taskId }, { context }) {
  try {
    const { status } = await MarketwatcherRunner.stop(context, { taskId });
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

async function subscribeMarketwatcherService(_, { params }, { context }) {
  try {
    await MarketwatcherRunner.subscribe(context, params);
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

async function unsubscribeMarketwatcherService(_, { params }, { context }) {
  try {
    await MarketwatcherRunner.unsubscribe(context, params);
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

export {
  startMarketwatcherService,
  stopMarketwatcherService,
  subscribeMarketwatcherService,
  unsubscribeMarketwatcherService
};

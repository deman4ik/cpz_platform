import { createErrorOutput } from "cpzUtils/error";
import MarketwatcherRunner from "../../taskrunner/services/marketwatcherRunner";

async function startMarketwatcher(_, { params }, { context }) {
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

async function stopMarketwatcher(_, { taskId }, { context }) {
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

async function subscribeMarketwatcher(_, { params }, { context }) {
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

async function unsubscribeMarketwatcher(_, { params }, { context }) {
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
  startMarketwatcher,
  stopMarketwatcher,
  subscribeMarketwatcher,
  unsubscribeMarketwatcher
};

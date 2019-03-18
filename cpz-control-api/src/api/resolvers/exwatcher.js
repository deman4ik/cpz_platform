import { createErrorOutput } from "cpz/utils/error";
import ExWatcherRunner from "../../taskrunner/tasks/exwatcherRunner";

async function startExWatcher(_, { params }, { context }) {
  try {
    const { taskId, status } = await ExWatcherRunner.start(context, params);
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

async function stopExWatcher(_, { taskId }, { context }) {
  try {
    const { status } = await ExWatcherRunner.stop(context, { taskId });
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

async function updateExWatcher(_, { taskId, params }, { context }) {
  try {
    await ExWatcherRunner.update(context, { taskId, ...params });
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

export { startExWatcher, stopExWatcher, updateExWatcher };

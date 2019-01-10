import ExWatcherRunner from "../../taskrunner/exwatcherRunner";

async function startExWatcher(_, { params }, { context }) {
  try {
    const { taskId, status } = await ExWatcherRunner.start(context, params);
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

async function stopExWatcher(_, { taskId }, { context }) {
  try {
    const { status } = await ExWatcherRunner.stop(context, { taskId });
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

async function updateExWatcher(_, { taskId, params }, { context }) {
  try {
    await ExWatcherRunner.update(context, { taskId, ...params });
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

export { startExWatcher, stopExWatcher, updateExWatcher };

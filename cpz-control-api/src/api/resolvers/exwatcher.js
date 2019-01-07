import ExWatcherRunner from "../../taskrunner/exwatcherRunner";

async function startExWatcher(_, { params }) {
  try {
    const { taskId, status } = await ExWatcherRunner.start(params);
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

async function stopExWatcher(_, { taskId }) {
  try {
    const { status } = await ExWatcherRunner.stop({ taskId });
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

async function updateExWatcher(_, { taskId, params }) {
  try {
    await ExWatcherRunner.update({ taskId, ...params });
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

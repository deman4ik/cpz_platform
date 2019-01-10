import MarketwatcherRunner from "../../taskrunner/services/marketwatcherRunner";

async function startMarketwatcher(_, { params }, { context }) {
  try {
    const { taskId, status } = await MarketwatcherRunner.start(params);
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

async function stopMarketwatcher(_, { taskId }, { context }) {
  try {
    const { status } = await MarketwatcherRunner.stop({ taskId });
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

async function subscribeMarketwatcher(_, { params }, { context }) {
  try {
    await MarketwatcherRunner.subscribe(context, params);
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

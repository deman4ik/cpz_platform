import MarketwatcherRunner from "../../taskrunner/services/marketwatcherRunner";

async function startMarketwatcher(_, { params }) {
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

async function stopMarketwatcher(_, { taskId }) {
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

async function subscribeMarketwatcher(_, { params }) {
  try {
    await MarketwatcherRunner.subscribe(params);
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

async function unsubscribeMarketwatcher(_, { params }) {
  try {
    await MarketwatcherRunner.unsubscribe(params);
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

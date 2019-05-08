import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventHub from "cpz/eventhub-client";
import { STATUS_STOPPED, STATUS_STOPPING } from "cpz/config/state";
import { EXWATCHER_SERVICE } from "cpz/config/services";
import ExWatcherRunner from "../../taskrunner/tasks/exwatcherRunner";

async function startExWatcher(_, { params }) {
  try {
    const { taskId, status } = await ExWatcherRunner.create(params);
    Log.clearContext();
    return {
      success: true,
      taskId,
      status
    };
  } catch (e) {
    let error;
    if (e instanceof ServiceError) {
      error = e;
    } else {
      error = new ServiceError(
        {
          name: ServiceError.types.CONTROL_ERROR,
          cause: e
        },
        "Failed to process request"
      );
    }
    Log.clearContext();
    return {
      success: false,
      error: error.json
    };
  }
}

async function stopExWatcher(_, { taskId }) {
  try {
    const state = await ExWatcherRunner.getState(taskId);
    const result = { success: true, taskId };
    if (
      state &&
      (state.status === STATUS_STOPPED || state.status === STATUS_STOPPING)
    ) {
      result.status = state.status;
    } else {
      await EventHub.send(taskId, {
        taskId,
        type: "stop",
        service: EXWATCHER_SERVICE
      });
      result.status = STATUS_STOPPING;
    }
    Log.clearContext();
    return result;
  } catch (e) {
    let error;
    if (e instanceof ServiceError) {
      error = e;
    } else {
      error = new ServiceError(
        {
          name: ServiceError.types.CONTROL_ERROR,
          cause: e
        },
        "Failed to process request"
      );
    }
    Log.clearContext();
    return {
      success: false,
      error: error.json
    };
  }
}

export { startExWatcher, stopExWatcher };

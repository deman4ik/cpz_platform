import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventHub from "cpz/eventhub-client";
import { STATUS_STOPPED, STATUS_STOPPING } from "cpz/config/state";
import { BACKTEST_SERVICE } from "cpz/config/services";
import { getRobotDB } from "cpz/db-client/robots";
import BacktestRunner from "../../taskrunner/tasks/backtestRunner";

async function startBacktest(
  _,
  { robotId, userId, dateFrom, dateTo, overrideParams }
) {
  try {
    const robot = await getRobotDB(robotId);
    const backtestParams = {
      ...robot,
      userId,
      dateFrom,
      dateTo,
      ...overrideParams
    };
    const { taskId, status } = await BacktestRunner.start(backtestParams);
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

async function stopBacktest(_, { taskId }) {
  try {
    const state = await BacktestRunner.getState(taskId);
    let result = { success: true };
    if (
      state &&
      (state.status === STATUS_STOPPED || state.status === STATUS_STOPPING)
    ) {
      result = {
        success: true,
        status: state.status
      };
    } else {
      await EventHub.send(taskId, {
        taskId,
        type: "stop",
        service: BACKTEST_SERVICE
      });
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

export { startBacktest, stopBacktest };

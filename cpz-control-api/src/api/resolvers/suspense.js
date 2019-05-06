import ServiceError from "cpz/error";
import Log from "cpz/log";
import {
  TASKS_ADVISER_PAUSE_EVENT,
  TASKS_ADVISER_RESUME_EVENT,
  TASKS_CANDLEBATCHER_PAUSE_EVENT,
  TASKS_CANDLEBATCHER_RESUME_EVENT,
  TASKS_TRADER_PAUSE_EVENT,
  TASKS_TRADER_RESUME_EVENT
} from "cpz/events/types/tasks";
import {
  getStartedAdvisers,
  getPausedAdvisers
} from "cpz/tableStorage-client/control/advisers";
import {
  getStartedCandlebatchers,
  getPausedCandlebatchers
} from "cpz/tableStorage-client/control/candlebatchers";
import {
  getStartedTraders,
  getPausedTraders
} from "cpz/tableStorage-client/control/traders";
import publishEvents from "../../utils/publishEvents";

async function pauseAdvisers() {
  try {
    const advisers = await getStartedAdvisers();
    const events = advisers.map(({ taskId }) => ({
      eventType: TASKS_ADVISER_PAUSE_EVENT,
      eventData: {
        subject: taskId,
        data: {
          taskId
        }
      }
    }));
    await publishEvents(events);
    Log.clearContext();
    return {
      success: true
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

async function pauseCandlebatchers() {
  try {
    const candlebatchers = await getStartedCandlebatchers();
    const events = candlebatchers.map(({ taskId }) => ({
      eventType: TASKS_CANDLEBATCHER_PAUSE_EVENT,
      eventData: {
        subject: taskId,
        data: {
          taskId
        }
      }
    }));
    await publishEvents(events);
    Log.clearContext();
    return {
      success: true
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

async function pauseTraders() {
  try {
    const traders = await getStartedTraders();
    const events = traders.map(({ taskId }) => ({
      eventType: TASKS_TRADER_PAUSE_EVENT,
      eventData: {
        subject: taskId,
        data: {
          taskId
        }
      }
    }));
    await publishEvents(events);
    Log.clearContext();
    return {
      success: true
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

async function resumeAdvisers() {
  try {
    const advisers = await getPausedAdvisers();
    const events = advisers.map(({ taskId }) => ({
      eventType: TASKS_ADVISER_RESUME_EVENT,
      eventData: {
        subject: taskId,
        data: {
          taskId
        }
      }
    }));
    await publishEvents(events);
    Log.clearContext();
    return {
      success: true
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

async function resumeCandlebatchers() {
  try {
    const candlebatchers = await getPausedCandlebatchers();
    const events = candlebatchers.map(({ taskId }) => ({
      eventType: TASKS_CANDLEBATCHER_RESUME_EVENT,
      eventData: {
        subject: taskId,
        data: {
          taskId
        }
      }
    }));
    await publishEvents(events);
    Log.clearContext();
    return {
      success: true
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

async function resumeTraders() {
  try {
    const traders = await getPausedTraders();
    const events = traders.map(({ taskId }) => ({
      eventType: TASKS_TRADER_RESUME_EVENT,
      eventData: {
        subject: taskId,
        data: {
          taskId
        }
      }
    }));
    await publishEvents(events);
    Log.clearContext();
    return {
      success: true
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

export {
  pauseAdvisers,
  pauseCandlebatchers,
  pauseTraders,
  resumeAdvisers,
  resumeCandlebatchers,
  resumeTraders
};

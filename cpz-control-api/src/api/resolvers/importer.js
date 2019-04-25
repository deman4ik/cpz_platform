import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import ImporterRunner from "../../taskrunner/services/importerRunner";

async function startImporter(_, { params }) {
  try {
    const { taskId, status, event } = await ImporterRunner.start(params);
    if (event) await EventGrid.publish(event.eventType, event.eventData);
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

async function stopImporter(_, { taskId }) {
  try {
    const { status, event } = await ImporterRunner.stop({ taskId });
    if (event) await EventGrid.publish(event.eventType, event.eventData);
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

export { startImporter, stopImporter };

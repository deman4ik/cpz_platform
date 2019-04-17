import ServiceError from "cpz/error";
import Log from "cpz/log";
import ImporterRunner from "../../taskrunner/services/importerRunner";

async function startImporter(_, { params }) {
  try {
    const { taskId, status } = await ImporterRunner.start(params);
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
    const { status } = await ImporterRunner.stop({ taskId });
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

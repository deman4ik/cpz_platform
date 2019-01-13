import { createErrorOutput } from "cpzUtils/error";
import ImporterRunner from "../../taskrunner/services/importerRunner";

async function startImporter(_, { params }, { context }) {
  try {
    const { taskId, status } = await ImporterRunner.start(context, params);
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

async function stopImporter(_, { taskId }, { context }) {
  try {
    const { status } = await ImporterRunner.stop(context, { taskId });
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

export { startImporter, stopImporter };

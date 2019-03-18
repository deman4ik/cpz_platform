import { createErrorOutput } from "cpz/utils/error";
import ImporterRunner from "../../taskrunner/services/importerRunner";

async function startImporterService(_, { params }, { context }) {
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

async function stopImporterService(_, { taskId }, { context }) {
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

export { startImporterService, stopImporterService };

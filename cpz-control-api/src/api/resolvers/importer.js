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
    return {
      success: false,
      error: error.message
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
    return {
      success: false,
      error: error.message
    };
  }
}

export { startImporter, stopImporter };

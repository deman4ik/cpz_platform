import ImporterRunner from "../../taskrunner/services/importerRunner";

async function startImporter(_, { params }) {
  try {
    const { taskId, status } = await ImporterRunner.start(params);
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

async function stopImporter(_, { taskId }) {
  try {
    const { status } = await ImporterRunner.stop({ taskId });
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

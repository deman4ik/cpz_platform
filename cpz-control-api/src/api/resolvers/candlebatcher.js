import CandlebatcherRunner from "../../taskrunner/services/candlebatcherRunner";

async function startCandlebatcher(_, { params }) {
  try {
    const { taskId, status } = await CandlebatcherRunner.start(params);
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

async function stopCandlebatcher(_, { taskId }) {
  try {
    const { status } = await CandlebatcherRunner.stop({ taskId });
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

async function updateCandlebatcher(_, { params }) {
  try {
    await CandlebatcherRunner.update(params);
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

export { startCandlebatcher, stopCandlebatcher, updateCandlebatcher };

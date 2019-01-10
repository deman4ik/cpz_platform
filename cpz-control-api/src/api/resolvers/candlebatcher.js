import CandlebatcherRunner from "../../taskrunner/services/candlebatcherRunner";

async function startCandlebatcher(_, { params }, { context }) {
  try {
    const { taskId, status } = await CandlebatcherRunner.start(context, params);
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

async function stopCandlebatcher(_, { taskId }, { context }) {
  try {
    const { status } = await CandlebatcherRunner.stop(context, { taskId });
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
    await CandlebatcherRunner.update(context, params);
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

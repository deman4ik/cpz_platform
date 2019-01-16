import { createErrorOutput } from "cpzUtils/error";
import CandlebatcherRunner from "../../taskrunner/services/candlebatcherRunner";

async function startCandlebatcherService(_, { params }, { context }) {
  try {
    const { taskId, status } = await CandlebatcherRunner.start(context, params);
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

async function stopCandlebatcherService(_, { taskId }, { context }) {
  try {
    const { status } = await CandlebatcherRunner.stop(context, { taskId });
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

async function updateCandlebatcherService(_, { params }, { context }) {
  try {
    await CandlebatcherRunner.update(context, params);
    return {
      success: true
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

export {
  startCandlebatcherService,
  stopCandlebatcherService,
  updateCandlebatcherService
};

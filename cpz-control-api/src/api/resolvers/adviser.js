import AdviserRunner from "../../taskrunner/services/adviserRunner";

async function startAdviser(_, { params }, { context }) {
  try {
    const { taskId, status } = await AdviserRunner.start(context, params);
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

async function stopAdviser(_, { taskId }, { context }) {
  try {
    const { status } = await AdviserRunner.stop(context, { taskId });
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

async function updateAdviser(_, { params }, { context }) {
  try {
    await AdviserRunner.update(context, params);
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

export { startAdviser, stopAdviser, updateAdviser };

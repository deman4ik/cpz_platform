import AdviserRunner from "../../taskrunner/services/adviserRunner";

async function startAdviser(_, { params }) {
  try {
    const { taskId, status } = await AdviserRunner.start(params);
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

async function stopAdviser(_, { taskId }) {
  try {
    const { status } = await AdviserRunner.stop({ taskId });
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

async function updateAdviser(_, { params }) {
  try {
    await AdviserRunner.update(params);
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

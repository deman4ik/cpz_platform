import { isProcessExists } from "../globalMarketwatchers";

function checkMarketwatcher(context, req) {
  try {
    const { taskId } = JSON.parse(req.rawBody);

    context.res = {
      status: 200,
      alive: isProcessExists(taskId)
    };
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: error,
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
  context.done();
}
export default checkMarketwatcher;

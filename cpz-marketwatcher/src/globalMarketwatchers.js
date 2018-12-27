import { fork } from "child_process";
import { tryParseJSON } from "cpzUtils/helpers";

const marketwatcherProcesses = {};

function isProcessExists(taskId) {
  if (Object.prototype.hasOwnProperty.call(marketwatcherProcesses, taskId)) {
    return marketwatcherProcesses[taskId].connected;
  }
  return false;
}
function createNewProcess(context, taskId, provider) {
  context.log("Creating new process ", taskId);
  marketwatcherProcesses[taskId] = fork(`./dist/${provider}.js`);
  marketwatcherProcesses[taskId].on("message", m => {
    context.log.info(
      ...m.map(msg => {
        const json = tryParseJSON(msg);
        if (json) {
          return json;
        }
        return msg;
      })
    );
  });
}

function sendEventToProcess(taskId, eventData) {
  marketwatcherProcesses[taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

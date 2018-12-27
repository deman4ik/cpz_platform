import { fork } from "child_process";
import { tryParseJSON } from "cpzUtils/helpers";

const processes = {};

function isProcessExists(taskId) {
  return Object.prototype.hasOwnProperty.call(processes, taskId);
}
function createNewProcess(context, taskId) {
  context.log("Creating new process ", taskId);
  processes[taskId] = fork(`./dist/process.js`);
  processes[taskId].on("message", m => {
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
  processes[taskId].on("exit", () => {
    delete processes[taskId];
  });
}

function sendEventToProcess(taskId, eventData) {
  processes[taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

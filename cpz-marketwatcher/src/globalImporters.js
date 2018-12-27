import { fork } from "child_process";
import { tryParseJSON } from "cpzUtils/helpers";

const importerProcesses = {};

function isProcessExists(taskId) {
  if (Object.prototype.hasOwnProperty.call(importerProcesses, taskId)) {
    return importerProcesses[taskId].connected;
  }
  return false;
}
function createNewProcess(context, taskId) {
  context.log("Creating new process ", taskId);
  importerProcesses[taskId] = fork(`./dist/importerProcess.js`);
  importerProcesses[taskId].on("message", m => {
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
  importerProcesses[taskId].on("exit", () => {
    delete importerProcesses[taskId];
  });
}

function sendEventToProcess(taskId, eventData) {
  importerProcesses[taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

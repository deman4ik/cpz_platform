import { fork } from "child_process";
import Log from "cpz/log";

const importerProcesses = {};

function isProcessExists(taskId) {
  if (Object.prototype.hasOwnProperty.call(importerProcesses, taskId)) {
    return importerProcesses[taskId].connected;
  }
  return false;
}
function createNewProcess(taskId) {
  importerProcesses[taskId] = fork(`./dist/importerProcess.js`);
  importerProcesses[taskId].on("exit", () => {
    delete importerProcesses[taskId];
  });
}

function sendEventToProcess(taskId, eventData) {
  importerProcesses[taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

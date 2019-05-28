import { fork } from "child_process";

const processes = {};

function isProcessExists(taskId) {
  return Object.prototype.hasOwnProperty.call(processes, taskId);
}
function createNewProcess(taskId) {
  processes[taskId] = fork(`./dist/process.js`);
  processes[taskId].on("exit", () => {
    delete processes[taskId];
  });
}

function sendEventToProcess(taskId, eventData) {
  processes[taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

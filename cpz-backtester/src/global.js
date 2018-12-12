import { fork } from "child_process";

const processes = {};

function isProcessExists(taskId) {
  return Object.prototype.hasOwnProperty.call(processes, taskId);
}
function createNewProcess(context, taskId) {
  context.log("Creating new process ", taskId);
  processes[taskId] = fork(`./dist/process.js`);
  processes[taskId].on("message", m => {
    context.log(m);
  });
  processes[taskId].on("exit", () => {
    delete processes[taskId];
  });
}

function sendEventToProcess(taskId, eventData) {
  processes[taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

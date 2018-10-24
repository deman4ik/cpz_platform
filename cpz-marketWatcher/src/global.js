import { fork } from "child_process";

const processes = {};

function isProcessExists(taskId) {
  if (Object.prototype.hasOwnProperty.call(processes, taskId)) {
    return processes[taskId].connected;
  }
  return false;
}
function createNewProcess(context, taskId, provider) {
  context.log("Creating new process ", taskId);
  processes[taskId] = fork(`./dist/${provider}.js`);
  processes[taskId].on("message", m => {
    // TODO: Error handling
    context.log(m);
  });
}

function sendEventToProcess(eventData) {
  processes[eventData.taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

import { fork } from "child_process";
import { getMarketwatcherById } from "cpz/tableStorage-client/control/marketwatchers";
import { STATUS_STOPPED } from "cpz/config/state";

const marketwatcherProcesses = {};

function isProcessExists(taskId) {
  if (Object.prototype.hasOwnProperty.call(marketwatcherProcesses, taskId)) {
    return marketwatcherProcesses[taskId].connected;
  }
  return false;
}

function createNewProcess(taskId, provider) {
  const providerName = provider || "cryptocompare";
  marketwatcherProcesses[taskId] = fork(`./dist/${providerName}.js`);
  marketwatcherProcesses[taskId].on("exit", async () => {
    delete marketwatcherProcesses[taskId];
    const marketwatcherState = await getMarketwatcherById(taskId);
    if (marketwatcherState.status !== STATUS_STOPPED) {
      createNewProcess(taskId, providerName);
      sendEventToProcess(taskId, {
        type: "start",
        state: marketwatcherState
      });
    }
  });
}

function sendEventToProcess(taskId, eventData) {
  marketwatcherProcesses[taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

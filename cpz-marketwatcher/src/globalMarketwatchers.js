import { fork } from "child_process";
import { tryParseJSON } from "cpzUtils/helpers";
import { getMarketwatcherById } from "cpzStorage";
import { STATUS_STOPPED } from "cpzState";

const marketwatcherProcesses = {};

function isProcessExists(taskId) {
  if (Object.prototype.hasOwnProperty.call(marketwatcherProcesses, taskId)) {
    return marketwatcherProcesses[taskId].connected;
  }
  return false;
}

function log(context, m) {
  context.log.info(
    ...m.map(msg => {
      const json = tryParseJSON(msg);
      if (json) {
        return json;
      }
      return msg;
    })
  );
}
function createNewProcess(context, taskId, provider) {
  context.log("Creating new process ", taskId);
  marketwatcherProcesses[taskId] = fork(`./dist/${provider}.js`);
  marketwatcherProcesses[taskId].on("message", m => {
    log(context, m);
  });
  marketwatcherProcesses[taskId].on("exit", async () => {
    delete marketwatcherProcesses[taskId];
    const marketwatcherState = await getMarketwatcherById(taskId);
    if (marketwatcherState.status !== STATUS_STOPPED) {
      createNewProcess(context, taskId, provider);
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

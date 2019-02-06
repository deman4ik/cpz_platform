import { fork } from "child_process";
import { tryParseJSON } from "cpzUtils/helpers";
import { getMarketwatcherById } from "cpzStorage/marketwatchers";
import { STATUS_STOPPED } from "cpzState";
import dayjs from "cpzDayjs";

const marketwatcherProcesses = {};

function isProcessExists(taskId) {
  if (Object.prototype.hasOwnProperty.call(marketwatcherProcesses, taskId)) {
    return marketwatcherProcesses[taskId].connected;
  }
  return false;
}

function log(m) {
  console.info(
    `[${dayjs().format("MM/DD/YYYY HH:mm:ss")}]`,
    ...m.map(msg => {
      const json = tryParseJSON(msg);
      if (json) {
        return json;
      }
      return msg;
    })
  );
}
function createNewProcess(taskId, provider) {
  const providerName = provider || "cryptocompare";
  console.log("Creating new process ", taskId, providerName);
  marketwatcherProcesses[taskId] = fork(`./dist/${providerName}.js`);
  marketwatcherProcesses[taskId].on("message", m => {
    log(m);
  });
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

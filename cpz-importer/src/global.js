import { fork } from "child_process";
import { tryParseJSON } from "cpzUtils/helpers";
import dayjs from "cpzDayjs";

const importerProcesses = {};

function isProcessExists(taskId) {
  if (Object.prototype.hasOwnProperty.call(importerProcesses, taskId)) {
    return importerProcesses[taskId].connected;
  }
  return false;
}
function createNewProcess(taskId) {
  console.log("Creating new process ", taskId);
  importerProcesses[taskId] = fork(`./dist/importerProcess.js`);
  importerProcesses[taskId].on("message", m => {
    console.info(
      `[${dayjs.utc().format("MM/DD/YYYY HH:mm:ss")}]`,
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

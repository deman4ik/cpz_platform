import { fork } from "child_process";
import { tryParseJSON } from "cpz/utils/helpers";
import dayjs from "cpz/utils/dayjs";
import Log from "cpz/log";

const processes = {};

function isProcessExists(taskId) {
  return Object.prototype.hasOwnProperty.call(processes, taskId);
}
function createNewProcess(taskId) {
  Log.info("Creating new process ", taskId);
  processes[taskId] = fork(`./dist/process.js`);
  processes[taskId].on("message", m => {
    Log.console(
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
  processes[taskId].on("exit", () => {
    delete processes[taskId];
  });
}

function sendEventToProcess(taskId, eventData) {
  processes[taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

import { fork } from "child_process";
import { tryParseJSON } from "cpzUtils/helpers";
import dayjs from "cpzDayjs";

const processes = {};

function isProcessExists(taskId) {
  return Object.prototype.hasOwnProperty.call(processes, taskId);
}
function createNewProcess(taskId) {
  console.log("Creating new process ", taskId);
  processes[taskId] = fork(`./dist/process.js`);
  processes[taskId].on("message", m => {
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
  });
  processes[taskId].on("exit", () => {
    delete processes[taskId];
  });
}

function sendEventToProcess(taskId, eventData) {
  processes[taskId].send(JSON.stringify(eventData));
}

export { isProcessExists, createNewProcess, sendEventToProcess };

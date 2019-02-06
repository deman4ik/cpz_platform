import "babel-polyfill";
import { getStartedMarketwatchers } from "cpzStorage/marketwatchers";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "./global";

async function timerTrigger() {
  const marketwatchers = await getStartedMarketwatchers();
  marketwatchers.forEach(marketwatcherState => {
    const isAlive = isProcessExists(marketwatcherState.taskId);
    if (isAlive) {
      sendEventToProcess(marketwatcherState.taskId, {
        type: "check",
        state: marketwatcherState
      });
    } else {
      createNewProcess(
        marketwatcherState.taskId,
        marketwatcherState.providerType
      );
      sendEventToProcess(marketwatcherState.taskId, {
        type: "start",
        state: marketwatcherState
      });
    }
  });
}

export default timerTrigger;

import "babel-polyfill";
import { getStartedMarketwatchers } from "cpzStorage/marketwatchers";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../globalMarketwatchers";

async function timerTrigger(context, timer) {
  const timeStamp = new Date().toISOString();

  if (timer.isPastDue) {
    context.log.info("Timer trigger is running late!");
  }
  context.log.info("Timer trigger function ran!", timeStamp);
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
        context,
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

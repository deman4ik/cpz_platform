import "babel-polyfill";
import Log from "cpzUtils/log";
import { TRADER_SERVICE } from "cpzServices";
import positionsTimer from "../trader/positionsTimer";
import tradersTimer from "../trader/tradersTimer";

Log.setService(TRADER_SERVICE);

async function timerTrigger(context, timer) {
  Log.addContext(context);
  const timeStamp = new Date().toISOString();

  if (timer.isPastDue) {
    Log.warn("Timer trigger is running late!");
  }
  Log.debug("Timer trigger function ran!", timeStamp);
  handleTimers(context);
}

async function handleTimers(context) {
  await positionsTimer(context);
  await tradersTimer(context);
}

export default timerTrigger;

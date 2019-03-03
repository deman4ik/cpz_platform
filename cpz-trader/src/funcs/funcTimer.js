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
    context.log.info("Timer trigger is running late!");
  }
  context.log.info("Timer trigger function ran!", timeStamp);
  handleTimers(context);
}

async function handleTimers(context) {
  await positionsTimer(context);
  await tradersTimer(context);
}

export default timerTrigger;

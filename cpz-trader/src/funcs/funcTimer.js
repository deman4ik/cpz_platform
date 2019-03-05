import "babel-polyfill";
import Log from "cpzLog";
import { TRADER_SERVICE } from "cpzServices";
import positionsTimer from "../trader/positionsTimer";
import tradersTimer from "../trader/tradersTimer";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: TRADER_SERVICE
});

async function timerTrigger(context, timer) {
  Log.addContext(context);
  const timeStamp = new Date().toISOString();

  if (timer.isPastDue) {
    Log.warn("Timer trigger is running late!");
  }
  Log.debug("Timer trigger function ran!", timeStamp);
  handleTimers(context);
  // TODO: Log.clearContext();
}

async function handleTimers(context) {
  await positionsTimer(context);
  await tradersTimer(context);
}

export default timerTrigger;

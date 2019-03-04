import "babel-polyfill";
import Log from "cpzUtils/log";
import { CANDLEBATCHER_SERVICE } from "cpzServices";
import handleCandlesTimer from "../batcher/handleTimer";

Log.setService(CANDLEBATCHER_SERVICE);

async function timerTrigger(context, timer) {
  Log.addContext(context);
  const timeStamp = new Date().toISOString();

  if (timer.isPastDue) {
    Log.warn("Timer trigger is running late!");
  }
  Log.debug("Timer trigger function ran!", timeStamp);
  handleCandlesTimer(context);
}

export default timerTrigger;

import "babel-polyfill";
import positionsTimer from "../trader/positionsTimer";
import tradersTimer from "../trader/tradersTimer";

async function timerTrigger(context, timer) {
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

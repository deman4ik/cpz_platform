const handleCandlesTimer = require("../batcher/handleTimer");

async function timerTrigger(context, timer) {
  const timeStamp = new Date().toISOString();

  if (timer.isPastDue) {
    context.log.info("Timer trigger is running late!");
  }
  context.log.info("Timer trigger function ran!", timeStamp);
  handleCandlesTimer(context);
}

module.exports = timerTrigger;

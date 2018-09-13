const handleCandlesTimer = require("../candles/handleTimer");

async function timerTrigger(context, timer) {
  const timeStamp = new Date().toISOString();

  if (timer.isPastDue) {
    context.log("Timer trigger is running late!");
  }
  context.log("Timer trigger function ran!", timeStamp);
  handleCandlesTimer(context, timer);
}

module.exports = timerTrigger;

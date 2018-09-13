const { getAllCandlebatchers } = require("../tableStorage");

async function handleTimer(context, timer) {
  context.log(timer);
}
module.exports = handleTimer;

const renewTorSession = require("./tor_controler");

let task = setTimeout(async function tick() {
  console.log("Renewing...");
  await renewTorSession();
  console.log("Ok wait 1 sec");
  task = setTimeout(tick, 9000);
}, 100);

import "babel-polyfill";
import Importer from "./importer";

process.on("message", async m => {
  const eventData = JSON.parse(m);
  if (eventData.type === "start") {
    const backtester = new Importer(eventData.state);
    await backtester.execute();
    process.exit(0);
  } else if (eventData.type === "stop") {
    process.send([`Importer ${eventData.taskId} stopped!`]);
    process.exit(0);
  } else {
    process.send(["Unknown child process event type"]);
  }
});

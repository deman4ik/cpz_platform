import "babel-polyfill";
import Backtester from "./backtester/backtester";

process.on("message", async m => {
  const eventData = JSON.parse(m);
  if (eventData.type === "start") {
    const backtester = new Backtester(eventData.state);
    await backtester.execute();
    process.exit(0);
  } else if (eventData.type === "stop") {
    process.send(`Backtester ${eventData.taskId} stopped!`);
    process.exit(0);
  } else {
    process.send("Unknown child process event type");
  }
});

import "babel-polyfill";
import Backtester from "./backtester";

process.on("message", async m => {
  const eventData = JSON.parse(m);
  if (eventData.type === "start") {
    try {
      const backtester = new Backtester(eventData.state);
      await backtester.execute();
    } catch (error) {
      process.send([
        `Backtester ${eventData.state.taskId} initialization error`,
        error.message
      ]);
    }
    process.exit(0);
  } else if (eventData.type === "stop") {
    process.send([`Backtester ${eventData.state.taskId} stopped!`]);
    process.exit(0);
  } else {
    process.send(["Unknown child process event type"]);
  }
});

import Log from "cpz/log";
import init from "../init";
import Backtester from "./backtester";

init();

process.on("message", async m => {
  const eventData = JSON.parse(m);
  if (eventData.type === "start") {
    try {
      const backtester = new Backtester(eventData.state);
      await backtester.execute();
    } catch (error) {
      Log.error(
        `${eventData.state.taskId} initialization error`,
        error.message
      );
    }
    process.exit(0);
  } else if (eventData.type === "stop") {
    process.exit(0);
  } else {
    Log.warn("Unknown child process event type");
  }
});

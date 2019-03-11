import "babel-polyfill";
import Log from "cpzLog";
import { BACKTESTER_SERVICE } from "cpzServices";
import Backtester from "./backtester";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: BACKTESTER_SERVICE
});

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
    Log.info(`${eventData.state.taskId} stopped!`);
    process.exit(0);
  } else {
    Log.warn("Unknown child process event type");
  }
});

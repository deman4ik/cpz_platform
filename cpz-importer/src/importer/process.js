import "babel-polyfill";
import Log from "cpz/log";
import Importer from "./importer";
import config from "../config";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: config.serviceName
});

process.on("message", async m => {
  const eventData = JSON.parse(m);
  if (eventData.type === "start") {
    const importer = new Importer(eventData.state);
    await importer.execute();
    process.exit(0);
  } else if (eventData.type === "stop") {
    Log.info(`${eventData.taskId} stopped!`);
    process.send([`Importer ${eventData.taskId} stopped!`]);
    process.exit(0);
  } else {
    Log.warn("Unknown child process event type");
    process.send(["Unknown child process event type"]);
  }
});

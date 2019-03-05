import "babel-polyfill";
import Log from "cpzLog";
import { IMPORTER_SERVICE } from "cpzServices";
import Importer from "./importer";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: IMPORTER_SERVICE
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

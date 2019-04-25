import "babel-polyfill";
import Log from "cpz/log";
import {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STOP_EVENT
} from "cpz/events/types/tasks/importer";
import {
  handleImportStart,
  handleImportStop
} from "../importer/handleTaskEvents";

async function eventHandler(req, res) {
  const { data, eventType } = req.body;

  try {
    if (eventType === TASKS_IMPORTER_START_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleImportStart(data);
    } else if (eventType === TASKS_IMPORTER_STOP_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleImportStop(data);
    }
  } catch (error) {
    Log.error(error);
  }
  Log.clearContext();
  // Send 200 to EventGrid and run handler for event
  res.status(200).end();
}

export default eventHandler;

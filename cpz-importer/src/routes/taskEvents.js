import "babel-polyfill";
import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import config from "../config";
import {
  handleImportStart,
  handleImportStop
} from "../importer/handleTaskEvents";

const {
  events: {
    types: { TASKS_IMPORTER_START_EVENT, TASKS_IMPORTER_STOP_EVENT }
  }
} = config;

async function eventHandler(req, res) {
  const { subject, data, eventType } = req.body;
  Log.clearContext();
  // Send 200 to EventGrid and run handler for event
  res.status(200).end();
  try {
    if (eventType === TASKS_IMPORTER_START_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleImportStart({ subject, ...data });
    } else if (eventType === TASKS_IMPORTER_STOP_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleImportStop({ subject, ...data });
    }
  } catch (error) {
    Log.error(error);
  }
}

export default eventHandler;

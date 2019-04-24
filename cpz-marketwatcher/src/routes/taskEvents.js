import "babel-polyfill";
import Log from "cpz/log";
import {
  handleStart,
  handleStop,
  handleSubscribe,
  handleUnsubscribe
} from "../marketwatcher/handleTaskEvents";
import config from "../config";

const {
  events: {
    types: {
      TASKS_MARKETWATCHER_START_EVENT,
      TASKS_MARKETWATCHER_STOP_EVENT,
      TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
      TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
    }
  }
} = config;

async function eventHandler(req, res) {
  const { subject, data, eventType } = req.body;
  Log.clearContext();
  // Send 200 to EventGrid and run handler for each event
  res.status(200).end();
  try {
    if (eventType === TASKS_MARKETWATCHER_START_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleStart({ eventSubject: subject, ...data });
    } else if (eventType === TASKS_MARKETWATCHER_STOP_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleStop({ eventSubject: subject, ...data });
    } else if (eventType === TASKS_MARKETWATCHER_SUBSCRIBE_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleSubscribe({ eventSubject: subject, ...data });
    } else if (eventType === TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleUnsubscribe({ eventSubject: subject, ...data });
    }
  } catch (e) {
    Log.warn(e);
  }
}

export default eventHandler;

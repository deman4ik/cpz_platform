import Log from "cpz/log";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
} from "cpz/events/types/tasks/marketwatcher";
import {
  handleStart,
  handleStop,
  handleSubscribe,
  handleUnsubscribe
} from "../marketwatcher/handleTaskEvents";

async function eventHandler(req, res) {
  const { data, eventType } = req.body;
  Log.clearContext();
  // Send 200 to EventGrid and run handler for each event
  res.status(200).end();
  try {
    if (eventType === TASKS_MARKETWATCHER_START_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleStart(data);
    } else if (eventType === TASKS_MARKETWATCHER_STOP_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleStop(data);
    } else if (eventType === TASKS_MARKETWATCHER_SUBSCRIBE_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleSubscribe(data);
    } else if (eventType === TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      await handleUnsubscribe(data);
    }
  } catch (e) {
    Log.warn(e);
  }
}

export default eventHandler;

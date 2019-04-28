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

  try {
    if (eventType === TASKS_MARKETWATCHER_START_EVENT) {
      await handleStart(data);
    } else if (eventType === TASKS_MARKETWATCHER_STOP_EVENT) {
      await handleStop(data);
    } else if (eventType === TASKS_MARKETWATCHER_SUBSCRIBE_EVENT) {
      await handleSubscribe(data);
    } else if (eventType === TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT) {
      await handleUnsubscribe(data);
    }
  } catch (e) {
    Log.exception(e);
  }
  Log.clearContext();
  // Send 200 to EventGrid and run handler for each event
  res.status(200).end();
}

export default eventHandler;

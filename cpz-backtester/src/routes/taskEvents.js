import Log from "cpz/log";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpz/events/types/tasks/backtester";
import { handleStart, handleStop } from "../backtester/handleTaskEvents";

/**
 * Handling BackTester Events
 * Operating with BackTester status.
 * @method
 * @param {Object} req - Http request
 * @param {Object} res - Http response
 */

async function eventHandler(req, res) {
  const { data, eventType } = req.body;

  try {
    if (eventType === TASKS_BACKTESTER_START_EVENT) {
      await handleStart(data);
    } else if (eventType === TASKS_BACKTESTER_STOP_EVENT) {
      await handleStop(data);
    }
  } catch (e) {
    Log.exception(e);
  }
  Log.clearContext();
  // Send 200 to EventGrid and run handler for each event
  res.status(200).end();
}

export default eventHandler;

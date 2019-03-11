import "babel-polyfill";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpzEventTypes";
import Log from "cpzLog";
import { BACKTESTER_SERVICE } from "cpzServices";
import { handleStart, handleStop } from "../backtester/handleTaskEvents";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: BACKTESTER_SERVICE
});

/**
 * Handling BackTester Events
 * Operating with BackTester status.
 * @method
 * @param {Object} req - Http request
 * @param {Object} res - Http response
 */

function eventHandler(req, res) {
  const events = req.body;
  // Send 200 to EventGrid and run handler for each event
  res.status(200).end();

  events.forEach(event => {
    const { subject, data, eventType } = event;
    if (eventType === TASKS_BACKTESTER_START_EVENT.eventType) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      handleStart({
        ...data,
        subject
      }).catch(e => Log.warn(e));
    } else if (eventType === TASKS_BACKTESTER_STOP_EVENT.eventType) {
      Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
      handleStop({
        ...data,
        subject
      }).catch(e => Log.warn(e));
    }
  });
}

export default eventHandler;

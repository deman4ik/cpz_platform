import "babel-polyfill";
import Log from "cpz/log";
import { handleStart, handleStop } from "../backtester/handleTaskEvents";
import config from "../config";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: config.serviceName
});

const {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} = config.events.types;

/**
 * Handling BackTester Events
 * Operating with BackTester status.
 * @method
 * @param {Object} req - Http request
 * @param {Object} res - Http response
 */

function eventHandler(req, res) {
  const { subject, data, eventType } = req.body;
  Log.request(req, res);
  Log.clearContext();
  // Send 200 to EventGrid and run handler for each event
  res.status(200).end();

  if (eventType === TASKS_BACKTESTER_START_EVENT) {
    Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
    handleStart({
      ...data,
      eventSubject: subject
    }).catch(e => Log.warn(e));
  } else if (eventType === TASKS_BACKTESTER_STOP_EVENT) {
    Log.info(`Got ${eventType} event data ${JSON.stringify(data)}`);
    handleStop({
      ...data,
      eventSubject: subject
    }).catch(e => Log.warn(e));
  }
}

export default eventHandler;

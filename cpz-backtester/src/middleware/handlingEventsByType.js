import Log from "cpzLog";
import {
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT,
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpzEventTypes";

/**
 * Event handling by type
 *
 * @function
 * @param {Object} req - Http request
 * @param {Object} res - Http response
 * @param {Function} next - function processed req, res to the next middleware
 * */
export default (req, res, next) => {
  const neededEvents = [
    TASKS_BACKTESTER_START_EVENT.eventType,
    TASKS_BACKTESTER_STOP_EVENT.eventType
  ];
  const events = req.body;
  // Hack for https://github.com/MicrosoftDocs/azure-docs/issues/14325
  if (events.length > 1) {
    Log.error("Microsoft has changes event policy about eventGrid body length");
  }
  // Getting first event for check his type
  const [event] = events;
  if (event.eventType === SUB_VALIDATION_EVENT.eventType) {
    Log.info(
      `Got ${event.eventType} event, validationCode: ${
        event.validationCode
      }, topic: ${event.topic}`
    );
    res.status(200).json({
      validationResponse: event.validationCode
    });
  } else if (event.eventType === SUB_DELETED_EVENT.eventType) {
    Log.info(`Got ${event.eventType} event: , topic: ${event.topic}`);
    res.status(200).end();
    // In this place if Event Grid batch, we expect what all events are same one type
  } else if (neededEvents.indexOf(event.eventType) !== -1) {
    Log.info(
      `Got ${event.eventType} event, data ${JSON.stringify(event.data)}`
    );
    next();
  } else {
    Log.error(`Unknown Event Type: ${event.eventType}`);
    res.status(202).end();
  }
};

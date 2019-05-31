import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
} from "cpz/events/types/tasks/marketwatcher";

/**
 * Validate events by target schema
 * if events is not valid call Log.warn() and skip even
 *
 * @function
 * @param {Object} req - Http request
 * @param {Object} res - Http response
 * @param {Function} next - function processed req, res to the next middleware
 * */
export default (req, res, next) => {
  const [event] = req.body;
  const { eventType, data } = event;
  try {
    if (eventType === TASKS_MARKETWATCHER_START_EVENT) {
      ServiceValidator.check(TASKS_MARKETWATCHER_START_EVENT, data);
      req.body = event;
      next();
    } else if (eventType === TASKS_MARKETWATCHER_STOP_EVENT) {
      ServiceValidator.check(TASKS_MARKETWATCHER_STOP_EVENT, data);
      req.body = event;
      next();
    } else if (eventType === TASKS_MARKETWATCHER_SUBSCRIBE_EVENT) {
      ServiceValidator.check(TASKS_MARKETWATCHER_SUBSCRIBE_EVENT, data);
      req.body = event;
      next();
    } else if (eventType === TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT) {
      ServiceValidator.check(TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT, data);
      req.body = event;
      next();
    } else {
      throw new Error(`Unknown event type ${eventType}`);
    }
  } catch (e) {
    Log.warn("Invalid event format", e);
    Log.clearContext();
    res.status(202).end();
  }
};

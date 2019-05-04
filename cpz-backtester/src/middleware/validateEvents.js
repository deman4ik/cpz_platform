import Log from "cpz/log";
import ServiceValidator from "cpz/validator/index";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpz/events/types/tasks/backtester";

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
  try {
    if (event.eventType === TASKS_BACKTESTER_START_EVENT) {
      ServiceValidator.check(TASKS_BACKTESTER_START_EVENT, event.data);
      req.body = event;
      next();
    } else if (event.eventType === TASKS_BACKTESTER_STOP_EVENT) {
      ServiceValidator.check(TASKS_BACKTESTER_STOP_EVENT, event.data);
      req.body = event;
      next();
    }
  } catch (e) {
    Log.warn("Invalid event format", e);
    res.status(202).end();
    Log.clearContext();
  }
};

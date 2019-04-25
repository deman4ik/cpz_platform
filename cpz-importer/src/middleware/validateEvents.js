import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STOP_EVENT
} from "cpz/events/types/tasks/importer";

/**
 * Validate events by target schema
 * if events is not valid call Log.warn() and exit
 *
 * @function
 * @param {Object} req - Http request
 * @param {Object} res - Http response
 * @param {Function} next - function processed req, res to the next middleware
 * */
export default (req, res, next) => {
  const [event] = req.body;
  try {
    if (event.eventType === TASKS_IMPORTER_START_EVENT) {
      ServiceValidator.check(TASKS_IMPORTER_START_EVENT, event.data);
      req.body = event;
      next();
    } else if (event.eventType === TASKS_IMPORTER_STOP_EVENT) {
      ServiceValidator.check(TASKS_IMPORTER_STOP_EVENT, event.data);
      req.body = event;
      next();
    }
  } catch (e) {
    Log.warn(e, "Invalid event format");
    Log.clearContext();
    res.status(202).end();
  }
};

import Log from "cpz/log";
import ServiceValidator from "cpz/validator";
import config from "../config";

const {
  events: {
    types: { TASKS_BACKTESTER_START_EVENT, TASKS_BACKTESTER_STOP_EVENT }
  }
} = config;
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
  /* eslint no-restricted-syntax: ["error"] */
  if (event.eventType === TASKS_BACKTESTER_START_EVENT.eventType) {
    try {
      ServiceValidator.check(TASKS_BACKTESTER_START_EVENT, event.data);
      req.body = event;
      next();
    } catch (e) {
      Log.warn(e, "Invalid event format");
    }
  } else if (event.eventType === TASKS_BACKTESTER_STOP_EVENT.eventType) {
    try {
      ServiceValidator.check(TASKS_BACKTESTER_STOP_EVENT, event.data);
      req.body = event;
      next();
    } catch (e) {
      Log.warn(e, "Invalid event format");
    }
  } else {
    Log.request(req, res);
    Log.clearContext();
    res.status(202).end();
  }
};
import Log from "cpzLog";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
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
  const events = req.body;
  const validatorStartEvent = createValidator(
    TASKS_BACKTESTER_START_EVENT.dataSchema
  );
  const validatorStopEvent = createValidator(
    TASKS_BACKTESTER_STOP_EVENT.dataSchema
  );
  const validEvents = [];
  /* eslint no-restricted-syntax: ["error"] */
  for (const event of events) {
    if (event.eventType === TASKS_BACKTESTER_START_EVENT.eventType) {
      try {
        genErrorIfExist(validatorStartEvent(event));
        validEvents.push(event);
      } catch (e) {
        Log.warn(`Invalid event format: ${event}`);
      }
    } else if (event.eventType === TASKS_BACKTESTER_STOP_EVENT.eventType) {
      try {
        genErrorIfExist(validatorStopEvent(event));
        validEvents.push(event);
      } catch (e) {
        Log.warn(`Invalid event format: ${event}`);
      }
    }
  }
  res.body = validEvents;
  next();
};

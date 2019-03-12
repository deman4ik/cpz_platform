import VError from "verror";
import { createValidator, genErrorIfExist } from "../../utils/validation";
import Log from "../../log";

/**
 * Validate events by target schema
 * if events is not valid call log.warn
 *
 * @function
 * @param {Object} event - EventGrid Events
 * @param {Object} schema - event schema
 * @return {Promise} Array of valid events
 * */

export default (event, schema) => {
  return new Promise((resolve, reject) => {
    const validator = createValidator(schema);
    try {
      genErrorIfExist(validator(event));
      resolve(event);
    } catch (e) {
      Log.warn(`Invalid event format: ${event}`);
      reject(new VError("Invalid event format"));
    }
  });
};
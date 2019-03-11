import {
  SUB_DELETED_EVENT,
  SUB_VALIDATION_EVENT
} from "../../config/events/types";
import Log from "../../log";

/**
 * Event handling by type
 *
 * @param {Object} context - context of Azure Functions
 * @param {Object} req - HTTP request
 * @param {String[]} neededEvents - needed events types
 * @return {Promise} Array of needed events same one type
 * */

export default (context, req, neededEvents) => {
  return new Promise(resolve => {
    const events = req.body;
    // All filteredEvents is same one type
    // Hack for https://github.com/MicrosoftDocs/azure-docs/issues/14325
    if (events.length > 1) {
      Log.error(
        "Microsoft has changes event policy about eventGrid body length"
      );
    }

    // Getting first event for check his type
    const [event] = events;

    if (event.eventType === SUB_VALIDATION_EVENT.eventType) {
      Log.info(
        `Got ${event.eventType} event, validationCode: ${
          event.validationCode
        }, topic: ${event.topic}`
      );
      context.res = {
        status: 200,
        body: {
          validationResponse: event.validationCode
        },
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } else if (event.eventType === SUB_DELETED_EVENT.eventType) {
      Log.info(`Got ${event.eventType} event: , topic: ${event.topic}`);
      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
      // In this place if Event Grid batch, we expect what all events are same one type
    } else if (neededEvents.indexOf(event.eventType) !== -1) {
      Log.info(
        `Got ${event.eventType} event, data ${JSON.stringify(event.data)}`
      );
      resolve(event);
    } else {
      Log.error(`Unknown Event Type: ${event.eventType}`);
      context.done();
    }
  });
};

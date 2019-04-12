import {
  SUB_DELETED_EVENT,
  SUB_VALIDATION_EVENT
} from "../../events/types/base";
import Log from "../../log";

/**
 * Event handling by type
 *
 * @param {Object} context - context of Azure Functions
 * @param {Object} req - HTTP request
 * @param {String[]} neededEvents - needed events types
 * @return {Object} Needed Event
 * */

export default (context, req, neededEvents) => {
  const events = req.body;
  // All filteredEvents is same one type
  // Hack for https://github.com/MicrosoftDocs/azure-docs/issues/14325
  if (events.length > 1) {
    Log.error("Microsoft has changes event policy about eventGrid body length");
  }

  // Getting first event for check his type
  const [event] = events;
  Log.warn(event.eventType);
  Log.warn(SUB_VALIDATION_EVENT);
  if (event.eventType === SUB_VALIDATION_EVENT) {
    Log.info(
      `Got ${event.eventType} event, validationCode: ${
        event.data.validationCode
      }, topic: ${event.topic}`
    );
    context.res = {
      status: 200,
      body: {
        validationResponse: event.data.validationCode
      },
      headers: {
        "Content-Type": "application/json"
      }
    };

    return null;
  }
  if (event.eventType === SUB_DELETED_EVENT) {
    Log.info(`Got ${event.eventType} event: , topic: ${event.topic}`);
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    };

    return null;
    // In this place if Event Grid batch, we expect what all events are same one type
  }
  if (neededEvents.indexOf(event.eventType) !== -1) {
    Log.info(
      `Got ${event.eventType} event data: ${JSON.stringify(event.data)}`
    );
  } else {
    Log.error(`Unknown Event Type: ${event.eventType}`);

    return null;
  }
  return event;
};

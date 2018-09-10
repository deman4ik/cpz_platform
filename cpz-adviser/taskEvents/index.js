const {
  SUB_VALIDATION_EVENT,
  TASKS_ADVISER_START_EVENT
} = require("../utils/constants");
const handleStart = require("../tasks/handleStart");

function eventHandler(context, req) {
  const parsedReq = JSON.parse(req.rawBody);
  context.log(`CPZ Adviser processed a request.${JSON.stringify(parsedReq)}`);
  // TODO: SENDER ENDPOINT VALIDATION
  parsedReq.forEach(eventGridEvent => {
    const eventData = eventGridEvent.data;
    // Deserialize the event data into the appropriate type based on event type using if/elif/else
    if (eventGridEvent.eventType === SUB_VALIDATION_EVENT) {
      context.log.warn(
        `Got SubscriptionValidation event data, validationCode: ${
          eventData.validationCode
        }, topic: ${eventGridEvent.topic}`
      );
      context.res = {
        status: 200,
        body: {
          validationResponse: eventData.validationCode
        },
        headers: {
          "Content-Type": "application/json"
        }
      };
    } else if (eventGridEvent.eventType === TASKS_ADVISER_START_EVENT) {
      context.log(
        `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
          eventData
        )}`
      );
      handleStart(context, eventData);
    } else {
      context.log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
    }
  });

  context.done();
}

module.exports = eventHandler;
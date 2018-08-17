const {
  SUB_VALIDATION_EVENT,
  START_EVENT,
  STOP_EVENT
} = require("../utils/constants");

function eventHandler(context, req) {
  const parsedReq = JSON.parse(req.rawBody);
  context.log(`CPZ Importer processed a request.${JSON.stringify(parsedReq)}`);

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
    } else if (eventGridEvent.eventType === START_EVENT) {
      context.log(`Got ${START_EVENT} event data ${JSON.stringify(eventData)}`);
    } else if (eventGridEvent.eventType === STOP_EVENT) {
      context.log(`Got ${STOP_EVENT} event data ${JSON.stringify(eventData)}`);
    } else {
      context.log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
    }
  });

  context.done();
}

module.exports = eventHandler;

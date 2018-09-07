const {
    SUB_VALIDATION_EVENT,
    SIGNALS_NEW_SIGNAL_EVENT
  } = require("../utils/constants");

  const handleSignal = require("../tasks/handleSignal");

  function eventHandler(context, req) {
    const parsedReq = JSON.parse(req.rawBody);

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
      } else if (eventGridEvent.eventType === SIGNALS_NEW_SIGNAL_EVENT) {
        context.log(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );

        handleSignal(context,eventData);

      } else {
        context.log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
      }
    });
  
    context.done();
  }
  
  module.exports = eventHandler;
  
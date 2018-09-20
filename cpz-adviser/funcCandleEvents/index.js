const { SUB_VALIDATION_EVENT, CANDLES_NEW_CANDLE_EVENT } = require("../config");
const { handleCandle } = require("../adviser/handleEvents");

function eventHandler(context, req) {
  const parsedReq = JSON.parse(req.rawBody);
  context.log.info(
    `CPZ Adviser processed a request.${JSON.stringify(parsedReq)}`
  );
  // TODO: SENDER ENDPOINT VALIDATION
  parsedReq.forEach(eventGridEvent => {
    const eventData = eventGridEvent.data;
    const eventSubject = eventGridEvent.subject;
    switch (eventGridEvent.eventType) {
      case SUB_VALIDATION_EVENT: {
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
        break;
      }
      case CANDLES_NEW_CANDLE_EVENT: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleCandle(context, { eventSubject, ...eventData });
        break;
      }
      default: {
        context.log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
      }
    }
  });
  context.done();
}

module.exports = eventHandler;

import { SUB_VALIDATION_EVENT, CANDLES_NEWCANDLE_EVENT } from "cpzEventTypes";
import { handleCandle } from "../adviser/handleEvents";

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
      case SUB_VALIDATION_EVENT.eventType: {
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
      case CANDLES_NEWCANDLE_EVENT.eventType: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleCandle(context, { eventSubject, candle: eventData });
        break;
      }
      default: {
        context.log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
      }
    }
  });
  context.done();
}

export default eventHandler;

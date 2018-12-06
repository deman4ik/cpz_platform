import "babel-polyfill";
import { BASE_EVENT, SUB_VALIDATION_EVENT } from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import {
  handleStarted,
  handleStopped,
  handleUpdated
} from "../taskrunner/handleTaskEvents";

const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(context, req) {
  const parsedReq = JSON.parse(req.rawBody);
  context.log.info(
    `CPZ Control processed a request.${JSON.stringify(parsedReq)}`
  );
  // TODO: SENDER ENDPOINT VALIDATION
  parsedReq.forEach(eventGridEvent => {
    // Валидация структуры события
    genErrorIfExist(validateEvent(eventGridEvent));
    const eventData = eventGridEvent.data;
    const eventSubject = eventGridEvent.subject;
    const { eventType } = eventGridEvent;
    if (eventType === SUB_VALIDATION_EVENT) {
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
    } else if (eventType.includes(".Started")) {
      context.log.info(
        `Got ${eventType} event data ${JSON.stringify(eventData)}`
      );
      handleStarted(context, { eventSubject, eventType, ...eventData });
    } else if (eventType.includes(".Stopped")) {
      context.log.info(
        `Got ${eventType} event data ${JSON.stringify(eventData)}`
      );
      handleStopped(context, { eventSubject, eventType, ...eventData });
    } else if (eventType.includes(".Updated")) {
      context.log.info(
        `Got ${eventType} event data ${JSON.stringify(eventData)}`
      );
      handleUpdated(context, { eventSubject, eventType, ...eventData });
    } else {
      context.log.error(`Unknown Event Type: ${eventType}`);
    }
  });
  context.done();
}

export default eventHandler;

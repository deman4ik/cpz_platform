import "babel-polyfill";
import VError from "verror";
import { BASE_EVENT, SUB_VALIDATION_EVENT } from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import {
  handleStarted,
  handleStopped,
  handleUpdated,
  handleFinished
} from "../taskrunner/handleTaskEvents";

const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(context, req) {
  try {
    if (req.query["api-key"] !== process.env.API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = JSON.parse(req.rawBody);
    context.log.info(
      `CPZ Control processed a request.${JSON.stringify(parsedReq)}`
    );
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
      } else if (eventType.includes(".Finished")) {
        context.log.info(
          `Got ${eventType} event data ${JSON.stringify(eventData)}`
        );
        handleFinished(context, { eventSubject, eventType, ...eventData });
      } else {
        context.log.error(`Unknown Event Type: ${eventType}`);
      }
    });
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: error.name === "UNAUTHENTICATED" ? 401 : 500,
      body: error.message,
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
  context.done();
}

export default eventHandler;

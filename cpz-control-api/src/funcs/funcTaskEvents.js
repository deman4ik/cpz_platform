import "babel-polyfill";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT
} from "cpzEventTypes";
import Log from "cpzLog";
import { CONTROL_SERVICE } from "cpzServices";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import {
  handleStarted,
  handleStopped,
  handleUpdated,
  handleFinished
} from "../taskrunner/handleTaskEvents";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: CONTROL_SERVICE
});
const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(context, req) {
  try {
    Log.addContext(context);
    if (req.query["api-key"] !== process.env.API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = JSON.parse(req.rawBody);
    Log.debug("Processed a request", JSON.stringify(parsedReq));
    // TODO: event schema validation by type
    parsedReq.forEach(eventGridEvent => {
      // Валидация структуры события
      genErrorIfExist(validateEvent(eventGridEvent));
      const eventData = eventGridEvent.data;
      const eventSubject = eventGridEvent.subject;
      const { eventType } = eventGridEvent;
      if (eventType.includes(".Started")) {
        Log.info(`Got ${eventType} event data ${JSON.stringify(eventData)}`);
        handleStarted(context, { eventSubject, eventType, ...eventData });
      } else if (eventType.includes(".Stopped")) {
        Log.info(`Got ${eventType} event data ${JSON.stringify(eventData)}`);
        handleStopped(context, { eventSubject, eventType, ...eventData });
      } else if (eventType.includes(".Updated")) {
        Log.info(`Got ${eventType} event data ${JSON.stringify(eventData)}`);
        handleUpdated(context, { eventSubject, eventType, ...eventData });
      } else if (eventType.includes(".Finished")) {
        Log.info(`Got ${eventType} event data ${JSON.stringify(eventData)}`);
        handleFinished(context, { eventSubject, eventType, ...eventData });
      } else if (eventType === SUB_VALIDATION_EVENT.eventType) {
        Log.warn(
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
      } else if (eventType === SUB_DELETED_EVENT.eventType) {
        Log.warn(
          `Got SubscriptionDeletedEvent event data, topic: ${
            eventGridEvent.topic
          }`
        );
      } else {
        Log.error(`Unknown Event Type: ${eventType}`);
      }
    });
  } catch (error) {
    Log.error(error);
    context.res = {
      status: error.name === "UNAUTHENTICATED" ? 401 : 500,
      body: error.message,
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
  Log.request(context.req, context.res);
  context.done();
  // TODO: Log.clearContext();
}

export default eventHandler;

import {
  SUB_VALIDATION_EVENT,
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT
} from "cpzEventTypes";
import { handleStart, handleStop, handleUpdate } from "../adviser/handleEvents";

function eventHandler(context, req) {
  const parsedReq = JSON.parse(req.rawBody);
  context.log.info(
    `CPZ Adviser processed a request.${JSON.stringify(parsedReq)}`
  );
  // TODO: SENDER ENDPOINT VALIDATION
  // check req.originalUrl
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
      case TASKS_ADVISER_START_EVENT.eventType: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleStart(context, { eventSubject, ...eventData });
        break;
      }
      case TASKS_ADVISER_STOP_EVENT.eventType: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleStop(context, { eventSubject, ...eventData });
        break;
      }
      case TASKS_ADVISER_UPDATE_EVENT.eventType: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleUpdate(context, { eventSubject, ...eventData });
        break;
      }
      default: {
        context.log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
      }
    }
  });
  context.res = {
    status: 200
  };
  context.done();
}

export default eventHandler;

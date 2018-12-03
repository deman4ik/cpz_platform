import "babel-polyfill";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  TASKS_MARKETWATCHER_STARTED_EVENT,
  TASKS_MARKETWATCHER_STOPPED_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBED_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT,
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_UPDATED_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_STOPPED_EVENT,
  TASKS_IMPORTER_FINISHED_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_UPDATED_EVENT,
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_UPDATED_EVENT
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";

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
      case TASKS_MARKETWATCHER_STARTED_EVENT.eventType: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        // handleStart(context, { eventSubject, ...eventData });
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

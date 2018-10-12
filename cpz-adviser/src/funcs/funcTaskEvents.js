import "babel-polyfill";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STARTBACKTEST_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import {
  handleStart,
  handleStop,
  handleUpdate
} from "../adviser/handleTaskEvents";
import handleBacktest from "../backtester/handleBacktestEvents";

const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(context, req) {
  try {
    const parsedReq = JSON.parse(req.rawBody);
    context.log.info(
      `CPZ Adviser processed a request.${JSON.stringify(parsedReq)}`
    );
    // TODO: SENDER ENDPOINT VALIDATION
    // check req.originalUrl
    parsedReq.forEach(eventGridEvent => {
      // Валидация структуры события
      genErrorIfExist(validateEvent(eventGridEvent));
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
        case TASKS_ADVISER_STARTBACKTEST_EVENT.eventType: {
          context.log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleBacktest(context, { eventSubject, ...eventData });
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
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: error,
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
  context.done();
}

export default eventHandler;
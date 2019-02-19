import "babel-polyfill";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT,
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATE_EVENT
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { checkEnvVars } from "cpzUtils/environment";
import adviserEnv from "cpzEnv/adviser";
import {
  handleStart,
  handleStop,
  handleUpdate
} from "../adviser/handleTaskEvents";

checkEnvVars(adviserEnv.variables);
const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(context, req) {
  try {
    if (req.query["api-key"] !== process.env.API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = JSON.parse(req.rawBody);
    context.log.info(
      `CPZ Adviser processed a request.${JSON.stringify(parsedReq)}`
    );
    parsedReq.forEach(eventGridEvent => {
      // Валидация структуры события
      genErrorIfExist(validateEvent(eventGridEvent));
      const eventData = eventGridEvent.data;
      const eventSubject = eventGridEvent.subject;
      switch (eventGridEvent.eventType) {
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
        case SUB_DELETED_EVENT.eventType: {
          context.log.warn(
            `Got SubscriptionDeletedEvent event data, topic: ${
              eventGridEvent.topic
            }`
          );
          break;
        }
        default: {
          context.log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
        }
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

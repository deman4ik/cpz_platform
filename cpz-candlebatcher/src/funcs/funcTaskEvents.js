import "babel-polyfill";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT,
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { checkEnvVars } from "cpzUtils/environment";
import candlebatcherEnv from "cpzEnv/candlebatcher";
import Log from "cpzUtils/log";
import { CANDLEBATCHER_SERVICE } from "cpzServices";
import {
  handleStart,
  handleStop,
  handleUpdate
} from "../batcher/handleTaskEvents";

Log.setService(CANDLEBATCHER_SERVICE);
checkEnvVars(candlebatcherEnv.variables);
const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(context, req) {
  try {
    Log.addContext(context);
    if (req.query["api-key"] !== process.env.API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = JSON.parse(req.rawBody);
    Log.debug("Processed a request", JSON.stringify(parsedReq));
    parsedReq.forEach(eventGridEvent => {
      // Валидация структуры события
      genErrorIfExist(validateEvent(eventGridEvent));
      const eventData = eventGridEvent.data;
      const eventSubject = eventGridEvent.subject;
      switch (eventGridEvent.eventType) {
        case TASKS_CANDLEBATCHER_START_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStart(context, { eventSubject, ...eventData });
          break;
        }
        case TASKS_CANDLEBATCHER_STOP_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStop(context, { eventSubject, ...eventData });
          break;
        }
        case TASKS_CANDLEBATCHER_UPDATE_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleUpdate(context, { eventSubject, ...eventData });
          break;
        }
        case SUB_VALIDATION_EVENT.eventType: {
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
          break;
        }
        case SUB_DELETED_EVENT.eventType: {
          Log.warn(
            `Got SubscriptionDeletedEvent event data, topic: ${
              eventGridEvent.topic
            }`
          );
          break;
        }
        default: {
          Log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
        }
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
}

export default eventHandler;

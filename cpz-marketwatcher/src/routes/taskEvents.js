import "babel-polyfill";
import { v4 as uuid } from "uuid";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT,
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
} from "cpzEventTypes";
import Log from "cpzLog";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import {
  handleStart,
  handleStop,
  handleSubscribe,
  handleUnsubscribe
} from "../marketwatcher/handleTaskEvents";

const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(req, res) {
  try {
    Log.addContext({
      executionContext: {
        invocationId: uuid(),
        functionName: "taskEvents"
      }
    });
    if (req.query["api-key"] !== process.env.API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = req.body;
    Log.debug("Processed a request", JSON.stringify(parsedReq));
    parsedReq.forEach(eventGridEvent => {
      // Валидация структуры события
      genErrorIfExist(validateEvent(eventGridEvent));
      const eventData = eventGridEvent.data;
      const eventSubject = eventGridEvent.subject;
      switch (eventGridEvent.eventType) {
        case TASKS_MARKETWATCHER_START_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStart({ eventSubject, ...eventData });
          res.status(200);
          break;
        }
        case TASKS_MARKETWATCHER_STOP_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStop({ eventSubject, ...eventData });
          break;
        }
        case TASKS_MARKETWATCHER_SUBSCRIBE_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleSubscribe({ eventSubject, ...eventData });
          res.status(200);
          break;
        }
        case TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleUnsubscribe({ eventSubject, ...eventData });
          res.status(200);
          break;
        }
        case SUB_VALIDATION_EVENT.eventType: {
          Log.warn(
            `Got SubscriptionValidation event data, validationCode: ${
              eventData.validationCode
            }, topic: ${eventGridEvent.topic}`
          );
          res.status(200).send({
            validationResponse: eventData.validationCode
          });
          break;
        }
        case SUB_DELETED_EVENT.eventType: {
          Log.warn(
            `Got SubscriptionDeletedEvent event data, topic: ${
              eventGridEvent.topic
            }`
          );
          res.status(200);
          break;
        }
        default: {
          Log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
          res.status(200);
        }
      }
    });
  } catch (error) {
    Log.error(error);
    res
      .status(error.name === "UNAUTHENTICATED" ? 401 : 500)
      .send(error.message);
  }
  Log.request(req, res); // TODO: в отдельный middleware
  // TODO: Log.clearContext();
}

export default eventHandler;

import "babel-polyfill";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT
} from "cpzEventTypes";
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

    if (req.query["api-key"] !== process.env.API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = req.body;
    console.info(
      `CPZ Marketwatcher processed a request.${JSON.stringify(parsedReq)}`
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
          console.warn(
            `Got SubscriptionValidation event data, validationCode: ${
              eventData.validationCode
            }, topic: ${eventGridEvent.topic}`
          );
          res.send({
            validationResponse: eventData.validationCode
          });
          break;
        }
        case TASKS_MARKETWATCHER_START_EVENT.eventType: {
          console.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStart({ eventSubject, ...eventData });
          break;
        }
        case TASKS_MARKETWATCHER_STOP_EVENT.eventType: {
          console.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStop({ eventSubject, ...eventData });
          break;
        }
        case TASKS_MARKETWATCHER_SUBSCRIBE_EVENT.eventType: {
          console.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleSubscribe({ eventSubject, ...eventData });
          break;
        }
        case TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT.eventType: {
          console.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleUnsubscribe({ eventSubject, ...eventData });
          break;
        }
        default: {
          console.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
        }
      }
    });

    res.status(200);
  } catch (error) {
    console.error(error);
    res
      .status(error.name === "UNAUTHENTICATED" ? 401 : 500)
      .send(error.message);
  }
}

export default eventHandler;

import "babel-polyfill";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { handleStart, handleStop } from "../backtester/handleTaskEvents";

const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(req, res) {
  try {
    if (req.query["api-key"] !== process.env.API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = req.body;
    console.info(
      `CPZ Backtester processed a request.${JSON.stringify(parsedReq)}`
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
        case TASKS_BACKTESTER_START_EVENT.eventType: {
          console.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStart({
            ...eventData,
            eventSubject
          });
          break;
        }
        case TASKS_BACKTESTER_STOP_EVENT.eventType: {
          console.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStop({
            ...eventData,
            eventSubject
          });
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
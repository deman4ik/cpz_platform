import "babel-polyfill";
import { v4 as uuid } from "uuid";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT,
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT
} from "cpzEventTypes";
import Log from "cpzLog";
import { BACKTESTER_SERVICE } from "cpzServices";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { handleStart, handleStop } from "../backtester/handleTaskEvents";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: BACKTESTER_SERVICE
});
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
    // TODO: SENDER ENDPOINT VALIDATION
    // check req.originalUrl
    parsedReq.forEach(eventGridEvent => {
      // Валидация структуры события
      genErrorIfExist(validateEvent(eventGridEvent));
      const eventData = eventGridEvent.data;
      const eventSubject = eventGridEvent.subject;
      switch (eventGridEvent.eventType) {
        case TASKS_BACKTESTER_START_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStart({
            ...eventData,
            eventSubject
          });
          res.status(200);
          break;
        }
        case TASKS_BACKTESTER_STOP_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleStop({
            ...eventData,
            eventSubject
          });
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
  Log.request(req, res);
  // TODO: Log.clearContext();
}

export default eventHandler;

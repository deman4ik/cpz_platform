import "babel-polyfill";
import { v4 as uuid } from "uuid";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT,
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STOP_EVENT
} from "cpzEventTypes";
import Log from "cpzUtils/log";
import { IMPORTER_SERVICE } from "cpzServices";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import {
  handleImportStart,
  handleImportStop
} from "../importer/handleTaskEvents";

Log.setService(IMPORTER_SERVICE);
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
    console.info(
      `CPZ Importer processed a request.${JSON.stringify(parsedReq)}`
    );
    // TODO: SENDER ENDPOINT VALIDATION
    // check req.originalUrl
    parsedReq.forEach(eventGridEvent => {
      // Валидация структуры события
      genErrorIfExist(validateEvent(eventGridEvent));
      const eventData = eventGridEvent.data;
      const eventSubject = eventGridEvent.subject;
      switch (eventGridEvent.eventType) {
        case TASKS_IMPORTER_START_EVENT.eventType: {
          console.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleImportStart({ eventSubject, ...eventData });
          res.status(200);
          break;
        }
        case TASKS_IMPORTER_STOP_EVENT.eventType: {
          console.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleImportStop({ eventSubject, ...eventData });
          res.status(200);
          break;
        }
        case SUB_VALIDATION_EVENT.eventType: {
          console.warn(
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
          console.warn(
            `Got SubscriptionDeletedEvent event data, topic: ${
              eventGridEvent.topic
            }`
          );
          res.status(200);
          break;
        }
        default: {
          console.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
          res.status(200);
        }
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(error.name === "UNAUTHENTICATED" ? 401 : 500)
      .send(error.message);
  }
}

export default eventHandler;

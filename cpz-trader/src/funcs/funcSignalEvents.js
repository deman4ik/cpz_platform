import "babel-polyfill";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT,
  SIGNALS_NEWSIGNAL_EVENT
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import handleSignal from "../trader/handleSignalEvents";

const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(context, req) {
  try {
    if (req.query["api-key"] !== process.env.API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = JSON.parse(req.rawBody);
    context.log.info(
      `CPZ Trader processed a request.${JSON.stringify(parsedReq)}`
    );
    // TODO: SENDER ENDPOINT VALIDATION
    parsedReq.forEach(eventGridEvent => {
      // Валидация структуры события
      genErrorIfExist(validateEvent(eventGridEvent));
      const eventData = eventGridEvent.data;
      const eventSubject = eventGridEvent.subject;
      switch (eventGridEvent.eventType) {
        case SIGNALS_NEWSIGNAL_EVENT.eventType: {
          context.log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleSignal(context, { eventSubject, signal: eventData });
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

import "babel-polyfill";
import VError from "verror";
import {
  BASE_EVENT,
  SUB_VALIDATION_EVENT,
  SUB_DELETED_EVENT,
  TICKS_NEWTICK_EVENT
} from "cpzEventTypes";
import Log from "cpzUtils/log";
import { TRADER_SERVICE } from "cpzServices";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { handleTick } from "../trader/handlePriceEvents";

Log.setService(TRADER_SERVICE);
const validateEvent = createValidator(BASE_EVENT.dataSchema);

function eventHandler(context, req) {
  try {
    Log.addContext(context);
    if (req.query["api-key"] !== process.env.API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = JSON.parse(req.rawBody);
    Log.debug("Processed a request", JSON.stringify(parsedReq));
    // TODO: SENDER ENDPOINT VALIDATION
    parsedReq.forEach(eventGridEvent => {
      // Валидация структуры события
      genErrorIfExist(validateEvent(eventGridEvent));
      const eventData = eventGridEvent.data;
      const eventSubject = eventGridEvent.subject;
      switch (eventGridEvent.eventType) {
        case TICKS_NEWTICK_EVENT.eventType: {
          Log.info(
            `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
              eventData
            )}`
          );
          handleTick(context, { eventSubject, tick: eventData });
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
      status: 500,
      body: error,
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
  Log.request(context.req, context.res);
  context.done();
}

export default eventHandler;

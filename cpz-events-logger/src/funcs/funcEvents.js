import "babel-polyfill";
import VError from "verror";
import { SUB_VALIDATION_EVENT, SUB_DELETED_EVENT } from "cpzEventTypes";
import { checkEnvVars } from "cpzUtils/environment";
import eventsloggerEnv from "cpzEnv/eventslogger";
import Log from "cpzLog";
import { EVENTS_LOGGER_SERVICE } from "cpzServices";
import EventsLogger from "../eventslogger/eventslogger";
import Relay from "../emulator/relay";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: EVENTS_LOGGER_SERVICE
});
checkEnvVars(eventsloggerEnv.variables);

const { EG_EMULATOR_MODE, API_KEY } = process.env;
const relay = new Relay(EG_EMULATOR_MODE, API_KEY);

function handleEvent(context, req) {
  try {
    Log.addContext(context);
    if (req.query["api-key"] !== API_KEY) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = JSON.parse(req.rawBody);
    Log.debug("Processed a request", JSON.stringify(parsedReq));
    parsedReq.forEach(eventGridEvent => {
      switch (eventGridEvent.eventType) {
        case SUB_VALIDATION_EVENT.eventType: {
          Log.warn(
            `Got SubscriptionValidation event data, validationCode: ${
              eventGridEvent.data.validationCode
            }, topic: ${eventGridEvent.topic}`
          );
          context.res = {
            status: 200,
            body: {
              validationResponse: eventGridEvent.data.validationCode
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
          Log.info(`Got ${eventGridEvent.eventType} event.`);

          const eventslogger = new EventsLogger(context);
          eventslogger.save(eventGridEvent);

          if (EG_EMULATOR_MODE) {
            relay.send(context, eventGridEvent);
          }
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

export default handleEvent;

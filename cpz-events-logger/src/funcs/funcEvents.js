import "babel-polyfill";
import VError from "verror";
import { SUB_VALIDATION_EVENT } from "cpzEventTypes";
import { checkEnvVars } from "cpzUtils/environment";
import eventsloggerEnv from "cpzEnv/eventslogger";
import EventsLogger from "../eventslogger/eventslogger";

checkEnvVars(eventsloggerEnv.variables);

// const { EG_EMULATOR_MODE } = process.env;

function handleEvent(context, req) {
  try {
    if (
      process.env.EG_EMULATOR_MODE === "none" &&
      req.query["api-key"] !== process.env.API_KEY
    ) {
      throw new VError({ name: "UNAUTHENTICATED" }, "Invalid API Key");
    }
    const parsedReq = JSON.parse(req.rawBody);
    context.log.info(
      `CPZ Events Logger processed a request.${JSON.stringify(parsedReq)}`
    );
    parsedReq.forEach(eventGridEvent => {
      switch (eventGridEvent.eventType) {
        case SUB_VALIDATION_EVENT: {
          context.log.warn(
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
        default: {
          context.log.info(`Got ${eventGridEvent.eventType} event.`);

          const eventslogger = new EventsLogger(context);
          eventslogger.save(eventGridEvent);

          /*
          if (EG_EMULATOR_MODE) {
            
            const relay = require("../emulator/relay");
        
            relay(context, eventGridEvent);
          }
          */
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

export default handleEvent;

const { SUB_VALIDATION_EVENT } = require("../config");
const relay = require("../emulator");
const { saveToAllEvents } = require("../tableStorage");

const { EG_EMULATOR_MODE, LOG_TABLE_STORAGE } = process.env;
function handleEvent(context, req) {
  const parsedReq = JSON.parse(req.rawBody);
  context.log.info(
    `CPZ Events Logger processed a request.${JSON.stringify(parsedReq)}`
  );
  // TODO: SENDER ENDPOINT VALIDATION
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

        if (EG_EMULATOR_MODE) {
          relay(context, eventGridEvent);
        }
        if (LOG_TABLE_STORAGE) {
          saveToAllEvents(context, eventGridEvent);
        }
      }
    }
  });
  context.done();
}

module.exports = handleEvent;

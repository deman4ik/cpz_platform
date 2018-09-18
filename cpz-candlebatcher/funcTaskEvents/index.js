const {
  SUB_VALIDATION_EVENT,
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT,
  TASKS_CANDLEBATCHER_STARTIMPORT_EVENT,
  TASKS_CANDLEBATCHER_STOPIMPORT_EVENT
} = require("../config");
const {
  handleStart,
  handleStop,
  handleUpdate
} = require("../batcher/handleEvents");
const {
  handleImportStart,
  handleImportStop
} = require("../importer/handleEvents");

function eventHandler(context, req) {
  const parsedReq = JSON.parse(req.rawBody);
  context.log.info(
    `CPZ Candlebatcher processed a request.${JSON.stringify(parsedReq)}`
  );
  // TODO: SENDER ENDPOINT VALIDATION
  parsedReq.forEach(eventGridEvent => {
    const eventData = eventGridEvent.data;
    const eventSubject = eventGridEvent.subject;
    switch (eventGridEvent.eventType) {
      case SUB_VALIDATION_EVENT: {
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
      case TASKS_CANDLEBATCHER_START_EVENT: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleStart(context, { eventSubject, ...eventData });
        break;
      }
      case TASKS_CANDLEBATCHER_STOP_EVENT: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleStop(context, { eventSubject, ...eventData });
        break;
      }
      case TASKS_CANDLEBATCHER_UPDATE_EVENT: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleUpdate(context, { eventSubject, ...eventData });
        break;
      }
      case TASKS_CANDLEBATCHER_STARTIMPORT_EVENT: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleImportStart(context, { eventSubject, ...eventData });
        break;
      }
      case TASKS_CANDLEBATCHER_STOPIMPORT_EVENT: {
        context.log.info(
          `Got ${eventGridEvent.eventType} event data ${JSON.stringify(
            eventData
          )}`
        );
        handleImportStop(context, { eventSubject, ...eventData });
        break;
      }
      default: {
        context.log.error(`Unknown Event Type: ${eventGridEvent.eventType}`);
      }
    }
  });

  context.done();
}

module.exports = eventHandler;

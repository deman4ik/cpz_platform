import { v4 as uuid } from "uuid";
import Log from "cpz/log";
import ServiceError from "cpz/error";
import EventGrid from "cpz/events";
import { saveFailedEvent } from "cpz/tableStorage-client/events/events";
import { SERVICE_NAME } from "../config";

async function publishEvent(state, data) {
  try {
    const { eventType, eventData } = data;
    await EventGrid.publish(eventType, eventData);
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_EVENT_PUBLISH_ERROR,
        cause: e,
        info: {
          ...state,
          ...data
        }
      },
      "Failed to publish event"
    );
    Log.exception(error);
    const event = {
      ...data,
      error: error.json,
      ParitionKey: SERVICE_NAME,
      RowKey: uuid()
    };
    Log.event(event, event);
    try {
      await saveFailedEvent(event);
    } catch (storageErr) {
      Log.exception(storageErr);
    }
  }
}

async function publishEvents(state, events) {
  try {
    if (events && Array.isArray(events) && events.length > 0) {
      await Promise.all(events.map(async event => publishEvent(state, event)));
    }
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CANDLEBATCHER_EVENTS_PUBLISH_ERROR,
        cause: e,
        info: {
          ...state
        }
      },
      "Failed to publish events"
    );
    Log.exception(error);
  }
}
export default publishEvents;

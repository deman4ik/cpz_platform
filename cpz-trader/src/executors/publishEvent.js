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
        name: ServiceError.types.TRADER_EVENTS_PUBLISH_ERROR,
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
    Log.event(event.eventType, event);
    try {
      await saveFailedEvent(event);
    } catch (storageErr) {
      Log.exception(storageErr);
    }
  }
}
export default publishEvent;

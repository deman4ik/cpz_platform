import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import { saveFailedEvent } from "cpz/tableStorage-client/events/events";
import { SERVICE_NAME } from "../config";

async function publishEvents(events) {
  try {
    if (events && Array.isArray(events)) {
      await Promise.all(
        events.map(async data => {
          try {
            const { eventType, eventData } = data;
            await EventGrid.publish(eventType, eventData);
          } catch (e) {
            const error = new ServiceError(
              {
                name: ServiceError.types.CONTROL_EVENT_PUBLISH_ERROR,
                cause: e
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
        })
      );
    }
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CONTROL_EVENTS_PUBLISH_ERROR,
        cause: e
      },
      "Failed to publish events"
    );
    Log.exception(error);
  }
}

export default publishEvents;

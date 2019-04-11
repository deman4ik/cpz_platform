import Log from "cpz/log";
import ServiceError from "cpz/error";
import EventGrid from "cpz/events";
import { saveTraderFailedEvent } from "cpz/tableStorage-client/events/events";

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
    const event = { ...data, error: error.json };
    Log.event(event.eventType, event);
    try {
      await saveTraderFailedEvent(event);
    } catch (storageErr) {
      Log.exception(storageErr);
    }
  }
}
export default publishEvent;

import Log from "cpz/log";
import ServiceError from "cpz/error";
import EventGrid from "cpz/events";
import { ERROR_IMPORTER_ERROR_EVENT } from "cpz/events/types/error";
import Importer from "./importer";
import init from "../init";

init();

process.on("message", async m => {
  const eventData = JSON.parse(m);
  if (eventData.type === "start") {
    try {
      const importer = new Importer(eventData.state);
      await importer.execute();
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.IMPORTER_TASKS_EVENTS_ERROR,
          cause: e,
          info: {
            ...eventData.state,
            critical: true
          }
        },
        "Failed to run importer"
      );
      Log.exception(error);
      // Публикуем событие - ошибка
      await EventGrid.publish(ERROR_IMPORTER_ERROR_EVENT, {
        subject: eventData.state.taskId,
        data: {
          taskId: eventData.state.taskId,
          error: error.json
        }
      });
    }
    process.exit(0);
  } else if (eventData.type === "stop") {
    Log.info(`${eventData.taskId} stopped!`);
    process.send([`Importer ${eventData.taskId} stopped!`]);
    process.exit(0);
  } else {
    Log.warn("Unknown child process event type");
    process.send(["Unknown child process event type"]);
  }
});

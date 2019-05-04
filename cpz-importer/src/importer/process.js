import Log from "cpz/log";
import ServiceError from "cpz/error";
import EventGrid from "cpz/events";
import {
  IMPORTER_IMPORT_CANDLES_MODE,
  IMPORTER_WARMUP_CACHE_MODE
} from "cpz/config/state/types";
import { ERROR_IMPORTER_ERROR_EVENT } from "cpz/events/types/error";
import Importer from "./importer";
import CacheWarmer from "./cacheWarmer";
import init from "../init";

init();

process.on("message", async m => {
  const eventData = JSON.parse(m);
  const { type } = eventData;
  if (type === "start") {
    try {
      const { state } = eventData;
      if (state.mode === IMPORTER_IMPORT_CANDLES_MODE) {
        const importer = new Importer(state);
        await importer.execute();
      } else if (state.mode === IMPORTER_WARMUP_CACHE_MODE) {
        const cacheWarmer = new CacheWarmer(state);
        await cacheWarmer.execute();
      } else {
        Log.error("Unknown importer mode");
      }
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
  } else if (type === "stop") {
    Log.info(`${eventData.taskId} stopped!`);
    process.exit(0);
  } else {
    Log.error("Unknown child process event type");
  }
});

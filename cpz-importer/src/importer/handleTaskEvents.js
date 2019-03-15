import VError from "verror";
import publishEvents from "cpz/eventgrid";
import { createErrorOutput } from "cpz/utils/error";
import Log from "cpz/log";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../global";
import config from "../config";

const {
  serviceName,
  events: {
    topics: { TASKS_TOPIC },
    types: { TASKS_IMPORTER_STARTED_EVENT, TASKS_IMPORTER_STOPPED_EVENT }
  }
} = config;

/**
 * Запуск нового импортера свечей
 *
 * @param {*} eventData
 */

// TODO Add definition to eventData
async function handleImportStart(eventData) {
  try {
    createNewProcess(eventData.taskId);
    sendEventToProcess(eventData.taskId, {
      type: "start",
      state: eventData
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to start importer"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_IMPORTER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}
/**
 * Остановка импорта
 *
 * @param {*} eventData
 */
async function handleImportStop(eventData) {
  try {
    if (!isProcessExists(eventData.taskId)) {
      Log.warn('Importer task "%s" not started', eventData.taskId);
      return;
    }

    sendEventToProcess(eventData.taskId, {
      type: "stop",
      taskId: eventData.taskId
    });

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_IMPORTER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "ImporterError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to stop importer"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_IMPORTER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}

export { handleImportStart, handleImportStop };

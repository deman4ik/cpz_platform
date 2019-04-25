import ServiceError from "cpz/error";
import Log from "cpz/log";
import { TASKS_IMPORTER_STOPPED_EVENT } from "cpz/events/types/tasks/importer";
import { ERROR_IMPORTER_ERROR_EVENT } from "cpz/events/types/error";
import EventGrid from "cpz/events";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../global";

/**
 * Запуск нового импортера свечей
 *
 * @param {*} eventData
 */
async function handleImportStart(eventData) {
  try {
    createNewProcess(eventData.taskId);
    sendEventToProcess(eventData.taskId, {
      type: "start",
      state: eventData
    });
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.IMPORTER_TASKS_EVENTS_ERROR,
        cause: e,
        info: {
          ...eventData,
          critical: true
        }
      },
      "Failed to start importer"
    );

    // Публикуем событие - ошибка
    await EventGrid.publish(ERROR_IMPORTER_ERROR_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId,
        error: error.json
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

    await EventGrid.publish(TASKS_IMPORTER_STOPPED_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.IMPORTER_TASKS_EVENTS_ERROR,
        cause: e,
        info: {
          ...eventData
        }
      },
      "Failed to stop importer"
    );

    // Публикуем событие - ошибка
    await EventGrid.publish(ERROR_IMPORTER_ERROR_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId,
        error: error.json
      }
    });
  }
}

export { handleImportStart, handleImportStop };

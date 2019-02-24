import VError from "verror";
import { IMPORTER_SERVICE } from "cpzServices";
import publishEvents from "cpzEvents";
import { createErrorOutput } from "cpzUtils/error";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import {
  TASKS_IMPORTER_START_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_IMPORTER_STOP_EVENT,
  TASKS_IMPORTER_STOPPED_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
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

// TODO Add definition to eventData
async function handleImportStart(eventData) {
  const validateStart = createValidator(TASKS_IMPORTER_START_EVENT.dataSchema);
  try {
    // Валидация входных параметров
    const toValidate = validateStart(eventData);
    genErrorIfExist(toValidate);
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
    console.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: IMPORTER_SERVICE,
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
  const validateStop = createValidator(TASKS_IMPORTER_STOP_EVENT.dataSchema);
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStop(eventData));
    if (!isProcessExists(eventData.taskId)) {
      console.warn('Importer task "%s" not started', eventData.taskId);
      return;
    }

    sendEventToProcess(eventData.taskId, {
      type: "stop",
      taskId: eventData.taskId
    });

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: IMPORTER_SERVICE,
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
    console.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: IMPORTER_SERVICE,
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

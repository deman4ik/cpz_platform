import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STOP_EVENT,
  TASKS_BACKTESTER_STOPPED_EVENT
} from "cpz/events/types/tasks/backtester";
import { ERROR_BACKTESTER_ERROR_EVENT } from "cpz/events/types/error";
import ServiceValidator from "cpz/validator/index";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../global";

/**
 * Запуск бэктеста
 *
 * @param {*} eventData
 */
async function handleStart(eventData) {
  try {
    // Валидация входных параметров
    ServiceValidator.check(TASKS_BACKTESTER_START_EVENT, eventData);
    createNewProcess(eventData.taskId);
    sendEventToProcess(eventData.taskId, {
      type: "start",
      state: eventData
    });
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError,
        cause: ServiceError.types.BACKTESTER_ERROR,
        info: {
          ...eventData,
          critical: true
        }
      },
      "Failed to start backtester"
    );
    Log.error(error);
    // Публикуем событие - ошибка
    await EventGrid.publish(ERROR_BACKTESTER_ERROR_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId,
        error: error.json
      }
    });
  }
}

/**
 * Остановка бэктеста
 *

 * @param {*} eventData
 */
async function handleStop(eventData) {
  try {
    // Валидация входных параметров
    ServiceValidator.check(TASKS_BACKTESTER_STOP_EVENT, eventData);
    if (!isProcessExists(eventData.taskId)) {
      Log.warn('Backtester task "%s" not started', eventData.taskId);
      return;
    }

    sendEventToProcess(eventData.taskId, {
      type: "stop",
      taskId: eventData.taskId
    });

    // Публикуем событие - успех
    await EventGrid.publish(TASKS_BACKTESTER_STOPPED_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError,
        cause: ServiceError.types.BACKTESTER_ERROR,
        info: {
          ...eventData,
          critical: true
        }
      },
      "Failed to stop backtester"
    );
    Log.error(error);
    // Публикуем событие - ошибка
    await EventGrid.publish(ERROR_BACKTESTER_ERROR_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId,
        error: error.json
      }
    });
  }
}

export { handleStart, handleStop };

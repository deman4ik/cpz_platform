import VError from "verror";
import {
  TASKS_BACKTESTER_START_EVENT,
  TASKS_BACKTESTER_STARTED_EVENT,
  TASKS_BACKTESTER_STOP_EVENT,
  TASKS_BACKTESTER_STOPPED_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { BACKTESTER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../global";

const validateStart = createValidator(TASKS_BACKTESTER_START_EVENT.dataSchema);
const validateStop = createValidator(TASKS_BACKTESTER_STOP_EVENT.dataSchema);
/**
 * Запуск бэктеста
 *
 * @param {*} eventData
 */
async function handleStart(eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    createNewProcess(eventData.taskId);
    sendEventToProcess(eventData.taskId, {
      type: "start",
      state: eventData
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "BacktesterError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to start backtester"
      )
    );
    console.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: BACKTESTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_BACKTESTER_STARTED_EVENT,
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
 * Остановка бэктеста
 *

 * @param {*} eventData
 */
async function handleStop(eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStop(eventData));
    if (!isProcessExists(eventData.taskId)) {
      console.warn('Backtester task "%s" not started', eventData.taskId);
      return;
    }

    sendEventToProcess(eventData.taskId, {
      type: "stop",
      taskId: eventData.taskId
    });

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: BACKTESTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_BACKTESTER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "BacktesterError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to stop backtester"
      )
    );
    console.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: BACKTESTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_BACKTESTER_STOPPED_EVENT,
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

export { handleStart, handleStop };

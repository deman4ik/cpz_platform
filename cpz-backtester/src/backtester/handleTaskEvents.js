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
 * @param {*} context
 * @param {*} eventData
 */
async function handleStart(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    createNewProcess(context, eventData.taskId);
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: BACKTESTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_BACKTESTER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

/**
 * Остановка бэктеста
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStop(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStop(eventData));
    if (!isProcessExists(eventData.taskId)) {
      context.log.warn('Backtester task "%s" not started', eventData.taskId);
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: BACKTESTER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_BACKTESTER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

export { handleStart, handleStop };

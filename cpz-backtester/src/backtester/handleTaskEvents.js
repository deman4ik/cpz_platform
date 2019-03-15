import VError from "verror";
import Log from "cpz/log";
import publishEvents from "cpz/eventgrid";
import { createErrorOutput } from "cpz/utils/error";
import ServiceValidator from "cpz/validator/index";
import config from "../config";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../global";

const {
  serviceName,
  events: {
    types: {
      TASKS_BACKTESTER_START_EVENT,
      TASKS_BACKTESTER_STARTED_EVENT,
      TASKS_BACKTESTER_STOP_EVENT,
      TASKS_BACKTESTER_STOPPED_EVENT,
      TASKS_TOPIC
    }
  }
} = config;

ServiceValidator.add(config.events.schemas);

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
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
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
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
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
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
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

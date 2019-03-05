import VError from "verror";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STARTED_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_STOPPED_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UPDATED_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import Log from "cpzLog";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { MARKETWATCHER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../global";

const validateStart = createValidator(
  TASKS_MARKETWATCHER_START_EVENT.dataSchema
);
const validateStop = createValidator(TASKS_MARKETWATCHER_STOP_EVENT.dataSchema);
const validateSubscribe = createValidator(
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT.dataSchema
);
const validateUnsubscribe = createValidator(
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT.dataSchema
);

// TODO: Startup processes from storage
/**
 * Запуск нового наблюдателя за рынком
 *
 * @param {*} eventData
 */
async function handleStart(eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    if (isProcessExists(eventData.taskId)) {
      Log.warn('Marketwatcher task "%s" already started', eventData.taskId);
      return;
    }
    createNewProcess(eventData.taskId, eventData.providerType);
    sendEventToProcess(eventData.taskId, {
      type: "start",
      state: eventData
    });
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "MarketwatcherError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to start marketwatcher"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_STARTED_EVENT,
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
 * Остановка наблюдателя за рынков
 *
 * @param {*} eventData
 */
async function handleStop(eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStop(eventData));
    if (!isProcessExists(eventData.taskId)) {
      Log.warn(`Marketwatcher task "${eventData.taskId}" not started`);
      return;
    }

    sendEventToProcess(eventData.taskId, {
      type: "stop"
    });
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "MarketwatcherError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to stop marketwatcher"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_STOPPED_EVENT,
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
 * Подписаться на новые данные
 *
 * @param {*} eventData
 */
async function handleSubscribe(eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateSubscribe(eventData));
    if (!isProcessExists(eventData.taskId)) {
      throw new VError(
        'Marketwatcher task "%s"  not started',
        eventData.taskId
      );
    }

    sendEventToProcess(eventData.taskId, {
      type: "subscribe",
      subscriptions: eventData.subscriptions
    });
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_UPDATED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "MarketwatcherError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to subscribe"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_UPDATED_EVENT,
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
 * Отписаться от данных
 *
 * @param {*} eventData
 */
async function handleUnsubscribe(eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateUnsubscribe(eventData));
    if (!isProcessExists(eventData.taskId)) {
      throw new VError(
        'Marketwatcher task "%s"  not started',
        eventData.taskId
      );
    }

    sendEventToProcess(eventData.taskId, {
      type: "unsubscribe",
      subscriptions: eventData.subscriptions
    });
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_UPDATED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "MarketwatcherError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to unsubscribe"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_UPDATED_EVENT,
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

export { handleStart, handleStop, handleSubscribe, handleUnsubscribe };

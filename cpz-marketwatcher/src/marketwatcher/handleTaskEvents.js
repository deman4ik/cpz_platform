import ServiceError from "cpz/error";
import Log from "cpz/log";
import EventGrid from "cpz/events";
import ServiceValidator from "cpz/validator/index";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STARTED_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_STOPPED_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UPDATED_EVENT
} from "cpz/events/types/tasks/marketwatcher";
import { ERROR_MARKETWATCHER_ERROR_EVENT } from "cpz/events/types/error";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../global";

/**
 * Запуск нового наблюдателя за рынком
 *
 * @param {*} eventData
 */
async function handleStart(eventData) {
  try {
    // Валидация входных параметров

    ServiceValidator.check(TASKS_MARKETWATCHER_START_EVENT, eventData);
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
    await EventGrid.publish(TASKS_MARKETWATCHER_STARTED_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.MARKETWATCHER_TASKS_EVENTS_ERROR,
        cause: e,
        info: {
          ...eventData
        }
      },
      "Failed to start marketwatcher"
    );

    Log.error(error);
    // Публикуем событие - ошибка
    await EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId,
        error: error.json
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
    ServiceValidator.check(TASKS_MARKETWATCHER_STOP_EVENT, eventData);
    if (!isProcessExists(eventData.taskId)) {
      Log.warn(`Marketwatcher task "${eventData.taskId}" not started`);
      return;
    }

    sendEventToProcess(eventData.taskId, {
      type: "stop"
    });
    // Публикуем событие - успех
    await EventGrid.publish(TASKS_MARKETWATCHER_STOPPED_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.MARKETWATCHER_TASKS_EVENTS_ERROR,
        cause: e,
        info: {
          ...eventData
        }
      },
      "Failed to stop marketwatcher"
    );

    Log.error(error);
    // Публикуем событие - ошибка
    await EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId,
        error: error.json
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
    ServiceValidator.check(TASKS_MARKETWATCHER_SUBSCRIBE_EVENT, eventData);
    if (!isProcessExists(eventData.taskId)) {
      throw new Error('Marketwatcher task "%s"  not started', eventData.taskId);
    }

    sendEventToProcess(eventData.taskId, {
      type: "subscribe",
      subscriptions: eventData.subscriptions
    });
    // Публикуем событие - успех
    await EventGrid.publish(TASKS_MARKETWATCHER_UPDATED_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.MARKETWATCHER_TASKS_EVENTS_ERROR,
        cause: e,
        info: {
          ...eventData
        }
      },
      "Failed to subscribe"
    );

    Log.error(error);
    // Публикуем событие - ошибка
    await EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId,
        error: error.json
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
    ServiceValidator.check(TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT, eventData);
    if (!isProcessExists(eventData.taskId)) {
      throw new Error('Marketwatcher task "%s"  not started', eventData.taskId);
    }

    sendEventToProcess(eventData.taskId, {
      type: "unsubscribe",
      subscriptions: eventData.subscriptions
    });
    // Публикуем событие - успех
    await EventGrid.publish(TASKS_MARKETWATCHER_UPDATED_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.MARKETWATCHER_TASKS_EVENTS_ERROR,
        cause: e,
        info: {
          ...eventData
        }
      },
      "Failed to unsubscribe"
    );

    Log.error(error);
    // Публикуем событие - ошибка
    await EventGrid.publish(ERROR_MARKETWATCHER_ERROR_EVENT, {
      subject: eventData.taskId,
      data: {
        taskId: eventData.taskId,
        error: error.json
      }
    });
  }
}

export { handleStart, handleStop, handleSubscribe, handleUnsubscribe };

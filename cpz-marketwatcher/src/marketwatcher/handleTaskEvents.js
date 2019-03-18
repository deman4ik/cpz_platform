import VError from "verror";
import Log from "cpz/log";
import publishEvents from "cpz/eventgrid";
import { createErrorOutput } from "cpz/utils/error";
import ServiceValidator from "cpz/validator/index";
import {
  isProcessExists,
  createNewProcess,
  sendEventToProcess
} from "../global";
import config from "../config";

const {
  serviceName,
  events: {
    types: {
      TASKS_MARKETWATCHER_START_EVENT,
      TASKS_MARKETWATCHER_STARTED_EVENT,
      TASKS_MARKETWATCHER_STOP_EVENT,
      TASKS_MARKETWATCHER_STOPPED_EVENT,
      TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
      TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
      TASKS_MARKETWATCHER_UPDATED_EVENT,
      TASKS_TOPIC
    }
  }
} = config;

// Setup validator
ServiceValidator.add(config.events.schemas);

// TODO: Startup processes from storage
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
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
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
      service: serviceName,
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
    ServiceValidator.check(TASKS_MARKETWATCHER_STOP_EVENT, eventData);
    if (!isProcessExists(eventData.taskId)) {
      Log.warn(`Marketwatcher task "${eventData.taskId}" not started`);
      return;
    }

    sendEventToProcess(eventData.taskId, {
      type: "stop"
    });
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
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
      service: serviceName,
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
    ServiceValidator.check(TASKS_MARKETWATCHER_SUBSCRIBE_EVENT, eventData);
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
      service: serviceName,
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
      service: serviceName,
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
    ServiceValidator.check(TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT, eventData);
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
      service: serviceName,
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
      service: serviceName,
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

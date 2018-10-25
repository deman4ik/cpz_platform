import VError from "verror";
import {
  TASKS_MARKETWATCHER_START_EVENT,
  TASKS_MARKETWATCHER_STARTED_EVENT,
  TASKS_MARKETWATCHER_STOP_EVENT,
  TASKS_MARKETWATCHER_STOPPED_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_SUBSCRIBED_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBE_EVENT,
  TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import { createMarketwatcherSlug } from "cpzStorage/utils";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { MARKETWATCHER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { modeToStr } from "cpzUtils/helpers";
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
 * @param {*} context
 * @param {*} eventData
 */
async function handleStart(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    if (isProcessExists(eventData.taskId)) {
      throw new VError(
        'Marketwatcher task "%s" on host "%s" already started',
        eventData.taskId,
        eventData.hostId
      );
    }
    createNewProcess(context, eventData.taskId, eventData.provider);
    sendEventToProcess(eventData.taskId, {
      type: "start",
      context,
      state: eventData
    });
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        rowKey: eventData.taskId,
        partitionKey: createMarketwatcherSlug(
          process.env.HOST_ID,
          modeToStr(eventData.mode)
        )
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        hostId: process.env.HOST_ID,
        error: errorOutput
      }
    });
  }
}

/**
 * Остановка наблюдателя за рынков
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStop(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStop(eventData));
    if (!isProcessExists(eventData.taskId)) {
      throw new VError(
        'Marketwatcher task "%s" on host "%s" not started',
        eventData.taskId,
        process.env.HOST_ID
      );
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
        taskId: eventData.taskId,
        hostId: process.env.HOST_ID
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId,
        hostId: process.env.HOST_ID,
        error: errorOutput
      }
    });
  }
}

/**
 * Подписаться на новые данные
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleSubscribe(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateSubscribe(eventData));
    if (!isProcessExists(eventData.taskId)) {
      throw new VError(
        'Marketwatcher task "%s" on host "%s" not started',
        eventData.taskId,
        process.env.HOST_ID
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
      eventType: TASKS_MARKETWATCHER_SUBSCRIBED_EVENT,
      data: {
        taskId: eventData.taskId,
        hostId: process.env.HOST_ID
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_SUBSCRIBED_EVENT,
      data: {
        taskId: eventData.taskId,
        hostId: process.env.HOST_ID,
        error: errorOutput
      }
    });
  }
}

/**
 * Отписаться от данных
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleUnsubscribe(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateUnsubscribe(eventData));
    if (!isProcessExists(eventData.taskId)) {
      throw new VError(
        'Marketwatcher task "%s" on host "%s" not started',
        eventData.taskId,
        process.env.HOST_ID
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
      eventType: TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT,
      data: {
        taskId: eventData.taskId,
        hostId: process.env.HOST_ID
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_UNSUBSCRIBED_EVENT,
      data: {
        taskId: eventData.taskId,
        hostId: process.env.HOST_ID,
        error: errorOutput
      }
    });
  }
}

export { handleStart, handleStop, handleSubscribe, handleUnsubscribe };

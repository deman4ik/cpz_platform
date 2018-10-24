import dayjs from "dayjs";
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
import { STATUS_STARTED, STATUS_STOPPED, STATUS_BUSY } from "cpzState";
import { createMarketwatcherSlug } from "cpzStorage/utils";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { MARKETWATCHER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { modeToStr } from "cpzUtils/helpers";
import Marketwatcher from "./marketwatcher";

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

/**
 * Запуск нового советника
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStart(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    // Инициализируем класс советника
    const marketwatcher = new Marketwatcher(context, eventData);
    marketwatcher.start();
    // Публикуем событие - успех
    await publishEvents(context, TASKS_TOPIC, {
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
    await publishEvents(context, TASKS_TOPIC, {
      service: MARKETWATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_MARKETWATCHER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

async function handleStop(context, eventData) {}
async function handleSubscribe(context, eventData) {}
async function handleUnsubscribe(context, eventData) {}

export { handleStart, handleStop, handleSubscribe, handleUnsubscribe };

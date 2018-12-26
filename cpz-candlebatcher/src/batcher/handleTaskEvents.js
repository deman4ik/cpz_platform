import dayjs from "cpzDayjs";
import VError from "verror";
import {
  TASKS_CANDLEBATCHER_START_EVENT,
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOP_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_UPDATE_EVENT,
  TASKS_CANDLEBATCHER_UPDATED_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_BUSY } from "cpzState";
import publishEvents from "cpzEvents";
import { CANDLEBATCHER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import { getCandlebatcherById, updateCandlebatcherState } from "cpzStorage";
import Candlebatcher from "./candlebatcher";

const validateStart = createValidator(
  TASKS_CANDLEBATCHER_START_EVENT.dataSchema
);
const validateStop = createValidator(TASKS_CANDLEBATCHER_STOP_EVENT.dataSchema);
const validateUpdate = createValidator(
  TASKS_CANDLEBATCHER_UPDATE_EVENT.dataSchema
);
/**
 * Запуск нового загрузчика свечей
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStart(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    // Инициализируем новый загрузчик
    const candlebatcher = new Candlebatcher(context, eventData);
    await candlebatcher.loadHistoryToCache();
    await candlebatcher.warmUpCache();

    // Сохраняем состояние
    candlebatcher.end(STATUS_STARTED);
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: CANDLEBATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_CANDLEBATCHER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "CandlebatcherError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to start candlebatcher"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: CANDLEBATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_CANDLEBATCHER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}
/**
 * Остановка загрузчика свечей
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStop(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStop(eventData));
    // Запрашиваем текущее состояние по уникальному ключу
    const candlebatcherState = await getCandlebatcherById(eventData.taskId);

    // Генерируем новое состояние
    const newState = {
      RowKey: candlebatcherState.RowKey,
      PartitionKey: candlebatcherState.PartitionKey
    };
    // Если занят
    if (candlebatcherState.status === STATUS_BUSY) {
      // Создаем запрос на завершение при следующей итерации
      newState.stopRequested = true;
    } else {
      // Помечаем как остановленный
      newState.status = STATUS_STOPPED;
      newState.endedAt = dayjs().toJSON();
    }
    // Обновляем состояние
    await updateCandlebatcherState(newState);

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: CANDLEBATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_CANDLEBATCHER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "CandlebatcherError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to stop candlebatcher"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: CANDLEBATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_CANDLEBATCHER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}
/**
 * Обновление параметров загрузчика свечей
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleUpdate(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateUpdate(eventData));
    const candlebatcherState = await getCandlebatcherById(eventData.taskId);

    const newState = {
      RowKey: candlebatcherState.RowKey,
      PartitionKey: candlebatcherState.PartitionKey
    };
    // Если занят
    if (candlebatcherState.status === STATUS_BUSY) {
      newState.updateRequested = eventData.settings;
    } else {
      newState.settings = {
        ...candlebatcherState.settings,
        ...eventData.settings
      };
    }
    await updateCandlebatcherState(newState);

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: CANDLEBATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_CANDLEBATCHER_UPDATED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "CandlebatcherError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to stop candlebatcher"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: CANDLEBATCHER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_CANDLEBATCHER_UPDATED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

export { handleStart, handleStop, handleUpdate };

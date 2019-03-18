import dayjs from "cpz/utils/lib/dayjs";
import VError from "verror";
import Log from "cpz/log";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_BUSY } from "cpz/config/state";
import publishEvents from "cpz/eventgrid";
import { createErrorOutput } from "cpz/utils/error";
import {
  getCandlebatcherById,
  updateCandlebatcherState
} from "cpz/tableStorage/candlebatchers";
import Candlebatcher from "./candlebatcher";
import config from "../config";

const {
  serviceName,
  events: {
    topics: { TASKS_TOPIC },
    types: {
      TASKS_CANDLEBATCHER_STARTED_EVENT,
      TASKS_CANDLEBATCHER_STOPPED_EVENT,
      TASKS_CANDLEBATCHER_UPDATED_EVENT
    }
  }
} = config;

/**
 * Запуск нового загрузчика свечей
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStart(context, eventData) {
  try {
    // Инициализируем новый загрузчик
    const candlebatcher = new Candlebatcher(context, eventData);
    // Сохраняем состояние
    candlebatcher.end(STATUS_STARTED);
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
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
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_CANDLEBATCHER_STARTED_EVENT,
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
 * Остановка загрузчика свечей
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStop(context, eventData) {
  try {
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
      newState.endedAt = dayjs.utc().toISOString();
    }
    // Обновляем состояние
    await updateCandlebatcherState(newState);

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
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
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_CANDLEBATCHER_STARTED_EVENT,
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
 * Обновление параметров загрузчика свечей
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleUpdate(context, eventData) {
  try {
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
      service: serviceName,
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
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_CANDLEBATCHER_UPDATED_EVENT,
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

export { handleStart, handleStop, handleUpdate };

import dayjs from "cpz/utils/lib/dayjs";
import VError from "verror";

import Log from "cpz/log";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_BUSY } from "cpz/config/state";
import publishEvents from "cpz/eventgrid";
import { createErrorOutput } from "cpz/utils/error";
import { getAdviserById, updateAdviserState } from "cpz/tableStorage/advisers";
import Adviser from "./adviser";
import config from "../config";

/**
 * Запуск нового советника
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStart(context, eventData) {
  const {
    events: {
      topics: { TASKS_TOPIC },
      types: { TASKS_ADVISER_STARTED_EVENT }
    },
    serviceName
  } = config;
  try {
    // Инициализируем класс советника
    const adviser = new Adviser(context, eventData);
    // Сохраняем состояние
    adviser.end(STATUS_STARTED);
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to start adviser"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_STARTED_EVENT,
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
 * Остановка советника
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStop(context, eventData) {
  const {
    events: {
      topics: { TASKS_TOPIC },
      types: { TASKS_ADVISER_STOPPED_EVENT }
    },
    serviceName
  } = config;
  try {
    // Запрашиваем текущее состояние советника по уникальному ключу
    const adviserState = await getAdviserById(eventData.taskId);
    // Генерируем новое состояние
    const newState = {
      RowKey: adviserState.RowKey,
      PartitionKey: adviserState.PartitionKey
    };
    // Если занят
    if (adviserState.status === STATUS_BUSY) {
      // Создаем запрос на завершение при следующей итерации
      newState.stopRequested = true;
    } else {
      // Помечаем как остановленный
      newState.status = STATUS_STOPPED;
      newState.endedAt = dayjs.utc().toISOString();
    }
    // Обновляем состояние советника
    await updateAdviserState(newState);
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to stop adviser"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_STOPPED_EVENT,
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
 * Обновление параметров советника
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleUpdate(context, eventData) {
  const {
    events: {
      topics: { TASKS_TOPIC },
      types: { TASKS_ADVISER_UPDATED_EVENT }
    },
    serviceName
  } = config;
  try {
    const adviserState = await getAdviserById(eventData.taskId);
    const newState = {
      RowKey: adviserState.RowKey,
      PartitionKey: adviserState.PartitionKey
    };
    // Если занят
    if (adviserState.status === STATUS_BUSY) {
      newState.updateRequested = eventData.settings;
    } else {
      newState.settings = {
        ...adviserState.settings,
        ...eventData.settings
      };
    }
    await updateAdviserState(newState);

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_UPDATED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "AdviserError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to update adviser"
      )
    );
    Log.error(errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: serviceName,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_UPDATED_EVENT,
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

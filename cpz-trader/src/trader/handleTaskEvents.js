import dayjs from "cpzDayjs";
import VError from "verror";
import {
  TASKS_TRADER_START_EVENT,
  TASKS_TRADER_STARTED_EVENT,
  TASKS_TRADER_STOPPED_EVENT,
  TASKS_TRADER_STOP_EVENT,
  TASKS_TRADER_UPDATED_EVENT,
  TASKS_TRADER_UPDATE_EVENT,
  TASKS_TOPIC
} from "cpzEventTypes";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_BUSY } from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { TRADER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { getTraderById, updateTraderState } from "cpzStorage";
import Trader from "./trader";

const validateStart = createValidator(TASKS_TRADER_START_EVENT.dataSchema);
const validateStop = createValidator(TASKS_TRADER_STOP_EVENT.dataSchema);
const validateUpdate = createValidator(TASKS_TRADER_UPDATE_EVENT.dataSchema);

/**
 * Запуск нового проторговщика
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStart(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStart(eventData));
    // Инициализируем класс проторговщика
    const trader = new Trader(context, eventData);
    // Сохраняем состояние
    trader.end(STATUS_STARTED);
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_TRADER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to start trader"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_TRADER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

/**
 * Остановка проторговщика
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStop(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStop(eventData));
    // Запрашиваем текущее состояние проторговщика по уникальному ключу
    const traderState = await getTraderById(eventData.taskId);
    // Генерируем новое состояние
    const newState = {
      RowKey: traderState.RowKey,
      PartitionKey: traderState.PartitionKey
    };
    // Если занят
    if (traderState.status === STATUS_BUSY) {
      // Создаем запрос на завершение при следующей итерации
      newState.stopRequested = true;
    } else {
      // Помечаем как остановленный
      newState.status = STATUS_STOPPED;
      newState.endedAt = dayjs().toJSON();
    }
    // Обновляем состояние проторговщика
    await updateTraderState(newState);
    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_TRADER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to stop trader"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_TRADER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}
/**
 * Обновление параметров проторговщика
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleUpdate(context, eventData) {
  try {
    // Валидация входных параметров
    genErrorIfExist(validateUpdate(eventData));
    const traderState = await getTraderById(eventData.taskId);
    const newState = {
      RowKey: traderState.RowKey,
      PartitionKey: traderState.PartitionKey
    };
    // Если занят
    if (traderState.status === STATUS_BUSY) {
      newState.updateRequested = {
        debug: eventData.debug,
        settings: eventData.settings
      };
    } else {
      newState.debug = eventData.debug;
      newState.settings = eventData.settings;
    }
    await updateTraderState(newState);

    // Публикуем событие - успех
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_TRADER_UPDATED_EVENT,
      data: {
        taskId: eventData.taskId
      }
    });
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "TraderError",
          cause: error,
          info: {
            eventData
          }
        },
        "Failed to update trader"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(TASKS_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_TRADER_UPDATED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

export { handleStart, handleStop, handleUpdate };

import dayjs from "dayjs";
import VError from "verror";
import {
  TASKS_ADVISER_START_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_STOP_EVENT,
  TASKS_ADVISER_UPDATED_EVENT,
  TASKS_ADVISER_UPDATE_EVENT,
  ERROR_TOPIC,
  TASKS_TOPIC
} from "cpzEventTypes";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_BUSY } from "cpzState";
import { createAdviserSlug } from "cpzStorage/utils";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { ADVISER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { modeToStr } from "cpzUtils/helpers";
import Adviser from "./adviser";
import { getAdviserByKey, updateAdviserState } from "../tableStorage";

const validateStart = createValidator(TASKS_ADVISER_START_EVENT.dataSchema);
const validateStop = createValidator(TASKS_ADVISER_STOP_EVENT.dataSchema);
const validateUpdate = createValidator(TASKS_ADVISER_UPDATE_EVENT.dataSchema);

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
    const adviser = new Adviser(context, eventData);
    // Сохраняем состояние
    adviser.end(STATUS_STARTED);
    // Публикуем событие - успех
    await publishEvents(context, TASKS_TOPIC, {
      service: ADVISER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        rowKey: eventData.taskId,
        partitionKey: createAdviserSlug(
          eventData.exchange,
          eventData.asset,
          eventData.currency,
          eventData.timeframe,
          modeToStr(eventData.mode)
        )
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, TASKS_TOPIC, {
      service: ADVISER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_STARTED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
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
  try {
    // Валидация входных параметров
    genErrorIfExist(validateStop(eventData));
    // Ищем советника по уникальному ключу
    const getAdviserResult = await getAdviserByKey({
      rowKey: eventData.rowKey,
      partitionKey: eventData.partitionKey
    });
    // Если ошибка - генерируем исключение
    if (!getAdviserResult.isSuccess) throw getAdviserResult;
    // Текущее состояние советника
    const adviserState = getAdviserResult.data;
    // Генерируем новое состояние
    const newState = {
      RowKey: eventData.rowKey,
      PartitionKey: eventData.partitionKey
    };
    // Если занят
    if (adviserState.status === STATUS_BUSY) {
      // Создаем запрос на завершение при следующей итерации
      newState.stopRequested = true;
    } else {
      // Помечаем как остановленный
      newState.status = STATUS_STOPPED;
      newState.endedAt = dayjs().toJSON();
    }
    // Обновляем состояние советника
    const result = await updateAdviserState(newState);
    // Если ошибка - генерируем исключение
    if (!result.isSuccess)
      throw new Error(`Can't update state\n${result.error}`);
    // Публикуем событие - успех
    await publishEvents(context, TASKS_TOPIC, {
      service: ADVISER_SERVICE,
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, TASKS_TOPIC, {
      service: ADVISER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_STOPPED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
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
  try {
    // Валидация входных параметров
    genErrorIfExist(validateUpdate(eventData));
    const getCandlebatcherResult = await getAdviserByKey(eventData);
    if (getCandlebatcherResult.isSuccess) {
      const candlebatcherState = getCandlebatcherResult.data;
      const newState = {
        RowKey: eventData.rowKey,
        PartitionKey: eventData.partitionKey
      };
      // Если занят
      if (candlebatcherState.status === STATUS_BUSY) {
        newState.updateRequested = {
          eventSubject: eventData.eventSubject,
          debug: eventData.debug,
          settings: eventData.settings,
          requiredHistoryCache: eventData.requiredHistoryCache,
          requiredHistoryMaxBars: eventData.requiredHistoryMaxBars
        };
      } else {
        newState.eventSubject = eventData.eventSubject;
        newState.debug = eventData.debug;
        newState.settings = eventData.settings;
        newState.requiredHistoryCache = eventData.requiredHistoryCache;
        newState.requiredHistoryMaxBars = eventData.requiredHistoryMaxBars;
      }
      const result = await updateAdviserState(newState);
      if (!result.isSuccess)
        throw new Error(`Can't update state\n${result.error}`);
      // Публикуем событие - успех
      await publishEvents(context, TASKS_TOPIC, {
        service: ADVISER_SERVICE,
        subject: eventData.eventSubject,
        eventType: TASKS_ADVISER_UPDATED_EVENT,
        data: {
          taskId: eventData.taskId
        }
      });
    } else {
      throw getCandlebatcherResult;
    }
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
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, TASKS_TOPIC, {
      service: ADVISER_SERVICE,
      subject: eventData.eventSubject,
      eventType: TASKS_ADVISER_UPDATED_EVENT,
      data: {
        taskId: eventData.taskId,
        error: errorOutput
      }
    });
  }
}

export { handleStart, handleStop, handleUpdate };

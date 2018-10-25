const dayjs = require("dayjs");
const Candlebatcher = require("./candlebatcher");
const {
  getCandlebatcherByKey,
  updateCandlebatcherState
} = require("../tableStorage");
const {
  STATUS_STOPPED,
  STATUS_BUSY,
  TASKS_CANDLEBATCHER_STARTED_EVENT,
  TASKS_CANDLEBATCHER_STOPPED_EVENT,
  TASKS_CANDLEBATCHER_UPDATED_EVENT
} = require("../config");
const { publishEvents, createEvents } = require("../eventgrid");
const { createSlug } = require("../tableStorage/utils");
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
    candlebatcher.end();
    // Публикуем событие - успех
    await publishEvents(
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_CANDLEBATCHER_STARTED_EVENT,
        data: {
          taskId: eventData.taskId,
          rowKey: eventData.taskId,
          partitionKey: createSlug(
            eventData.exchange,
            eventData.asset,
            eventData.currency
          )
        }
      })
    );
  } catch (error) {
    context.log.error("Candlebatcher starting error:", error, eventData);
    // Публикуем событие - ошибка
    await publishEvents(
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_CANDLEBATCHER_STARTED_EVENT,
        data: {
          taskId: eventData.taskId,
          error
        }
      })
    );
  }
}
/**
 * Остановка загрузчика свечей
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStop(context, eventData) {
  let candlebatcherState;
  try {
    const getCandlebatcherResult = await getCandlebatcherByKey(context, {
      rowKey: eventData.rowKey,
      partitionKey: eventData.partitionKey
    });
    if (getCandlebatcherResult.isSuccess) {
      candlebatcherState = getCandlebatcherResult.data;
      const newState = {
        RowKey: eventData.rowKey,
        PartitionKey: eventData.partitionKey
      };
      // Если в работе
      if (candlebatcherState.status === STATUS_BUSY) {
        newState.stopRequested = true;
      } else {
        newState.status = STATUS_STOPPED;
        newState.endedAt = dayjs().toJSON();
      }
      const result = await updateCandlebatcherState(context, newState);
      if (!result.isSuccess)
        throw new Error(`Can't update state\n${result.error}`);
      // Публикуем событие - успех
      await publishEvents(
        "tasks",
        createEvents({
          subject: eventData.eventSubject,
          eventType: TASKS_CANDLEBATCHER_STOPPED_EVENT,
          data: {
            taskId: eventData.taskId
          }
        })
      );
    } else {
      throw getCandlebatcherResult;
    }
  } catch (error) {
    context.log.error("Candlebatcher stopping error:", error, eventData);
    // Публикуем событие - ошибка
    await publishEvents(
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_CANDLEBATCHER_STOPPED_EVENT,
        data: {
          taskId: eventData.taskId,
          error
        }
      })
    );
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
    const getCandlebatcherResult = await getCandlebatcherByKey(
      context,
      eventData
    );
    if (getCandlebatcherResult.isSuccess) {
      const candlebatcherState = getCandlebatcherResult.data;
      const newState = {
        RowKey: eventData.rowKey,
        PartitionKey: eventData.partitionKey
      };
      // Если в работе
      if (candlebatcherState.status === STATUS_BUSY) {
        newState.updateRequested = {
          eventSubject: eventData.eventSubject,
          debug: eventData.debug,
          timeframes: eventData.timeframes,
          proxy: eventData.proxy
        };
      } else {
        newState.eventSubject = eventData.eventSubject;
        newState.debug = eventData.debug;
        newState.timeframes = eventData.timeframes;
        newState.proxy = eventData.proxy;
      }
      const result = await updateCandlebatcherState(context, newState);
      if (!result.isSuccess)
        throw new Error(`Can't update state\n${result.error}`);
      // Публикуем событие - успех
      await publishEvents(
        "tasks",
        createEvents({
          subject: eventData.eventSubject,
          eventType: TASKS_CANDLEBATCHER_UPDATED_EVENT,
          data: {
            taskId: eventData.taskId
          }
        })
      );
    } else {
      throw getCandlebatcherResult;
    }
  } catch (error) {
    context.log.error("Candlebatcher updating error:", error, eventData);
    // Публикуем событие - ошибка
    await publishEvents(
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_CANDLEBATCHER_UPDATED_EVENT,
        data: {
          taskId: eventData.taskId,
          error
        }
      })
    );
  }
}

module.exports = { handleStart, handleStop, handleUpdate };

const dayjs = require("dayjs");
const Adviser = require("../adviser/adviser");
const {
  getAdviserByKey,
  getAdvisersBySlug,
  updateAdviserState,
  savePendingCandles
} = require("../tableStorage");
const {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_BUSY,
  ERROR_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_UPDATED_EVENT,
  CANDLES_HANDLED_EVENT
} = require("../config");
const { publishEvents, createEvents } = require("../eventgrid");
const { createSlug } = require("../tableStorage/utils");
const execute = require("./execute");
/**
 * Запуск нового советника
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleStart(context, eventData) {
  try {
    // Инициализируем класс советника
    const adviser = new Adviser(context, eventData);
    // Сохраняем состояние
    adviser.end(STATUS_STARTED);
    // Публикуем событие - успех
    await publishEvents(
      context,
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_ADVISER_STARTED_EVENT,
        data: {
          taskId: eventData.taskId,
          rowKey: eventData.taskId,
          partitionKey: createSlug(
            eventData.exchange,
            eventData.asset,
            eventData.currency,
            eventData.timeframe
          )
        }
      })
    );
  } catch (error) {
    context.log.error("Adviser starting error:", error, eventData);
    // Публикуем событие - ошибка
    await publishEvents(
      context,
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_ADVISER_STARTED_EVENT,
        data: {
          taskId: eventData.taskId,
          error
        }
      })
    );
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
    // Ищем советника по уникальному ключу
    const getAdviserResult = await getAdviserByKey(context, {
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
    const result = await updateAdviserState(context, newState);
    // Если ошибка - генерируем исключение
    if (!result.isSuccess)
      throw new Error(`Can't update state\n${result.error}`);
    // Публикуем событие - успех
    await publishEvents(
      context,
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_ADVISER_STOPPED_EVENT,
        data: {
          taskId: eventData.taskId
        }
      })
    );
  } catch (error) {
    context.log.error("Adviser stopping error:", error, eventData);
    // Публикуем событие - ошибка
    await publishEvents(
      context,
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_ADVISER_STOPPED_EVENT,
        data: {
          taskId: eventData.taskId,
          error
        }
      })
    );
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
    const getCandlebatcherResult = await getAdviserByKey(context, eventData);
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
      const result = await updateAdviserState(context, newState);
      if (!result.isSuccess)
        throw new Error(`Can't update state\n${result.error}`);
      // Публикуем событие - успех
      await publishEvents(
        context,
        "tasks",
        createEvents({
          subject: eventData.eventSubject,
          eventType: TASKS_ADVISER_UPDATED_EVENT,
          data: {
            taskId: eventData.taskId
          }
        })
      );
    } else {
      throw getCandlebatcherResult;
    }
  } catch (error) {
    context.log.error("Adviser updating error:", error, eventData);
    // Публикуем событие - ошибка
    await publishEvents(
      context,
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_ADVISER_UPDATED_EVENT,
        data: {
          taskId: eventData.taskId,
          error
        }
      })
    );
  }
}

/**
 * Обработка новой свечи
 *
 * @param {*} context
 * @param {*} candle
 */
async function handleCandle(context, data) {
  try {
    const { candle } = data;
    // Параметры запроса - биржа + инструмент + таймфрейм
    const slug = createSlug(
      candle.exchange,
      candle.asset,
      candle.currency,
      candle.timeframe
    );
    // Ищем подходящих советников
    const getAdvisersResult = await getAdvisersBySlug(context, slug);
    // Если ошибка - генерируем исключение
    if (!getAdvisersResult.isSuccess) throw getAdvisersResult;
    // Все подходящие советники
    const advisers = getAdvisersResult.data;
    // Фильтруем только доступные советники
    const startedAdvisers = advisers.filter(
      adviser => adviser.status === STATUS_STARTED
    );
    // Фильтруем только занятые советники
    const busyAdvisers = advisers.filter(
      adviser => adviser.status === STATUS_BUSY
    );
    // Запускаем параллельно всех доступных советников в работу
    const adviserExecutionResults = await Promise.all(
      startedAdvisers.map(async state => {
        const result = await execute(context, state, candle);
        return result;
      })
    );

    // Для занятых советников параллельно наполняем свечами очередь на дальнейшую обработку
    const pendingCandlesResults = await Promise.all(
      busyAdvisers.map(async state => {
        const newPendingCandle = {
          ...candle,
          taskId: state.taskId
        };
        const result = await savePendingCandles(context, newPendingCandle);
        return result;
      })
    );

    // Отбираем из результата выполнения только успешные
    const successAdvisers = adviserExecutionResults
      .filter(result => result.isSuccess === true)
      .map(result => result.taskId);
    // Отбираем из результата выполнения только не успешные
    const errorAdvisers = adviserExecutionResults
      .filter(result => result.isSuccess === false)
      .map(result => ({ taskId: result.taskId, error: result.error }));
    // TODO: обработать ошибки вставки в сторедж и отправить свечи в очередь
    // Отбираем из результата выполнения только успешные
    const successPendingAdvisers = pendingCandlesResults
      .filter(result => result.isSuccess === true)
      .map(result => result.taskId);
    // Отбираем из результата выполнения только не успешные
    const errorPendingAdvisers = pendingCandlesResults
      .filter(result => result.isSuccess === false)
      .map(result => ({ taskId: result.taskId, error: result.error }));

    // Публикуем событие - успех
    await publishEvents(
      context,
      "tasks",
      createEvents({
        subject: `${candle.exchange}/${candle.asset}/${candle.currency}/${
          candle.timeframe
        }`,
        eventType: CANDLES_HANDLED_EVENT,
        data: {
          candleId: candle.candleId,
          successAdvisers,
          errorAdvisers,
          successPendingAdvisers,
          errorPendingAdvisers
        }
      })
    );
  } catch (error) {
    context.log.error("Handle candle error:", error, data);
    // Публикуем событие - ошибка
    await publishEvents(
      context,
      "log",
      createEvents({
        subject: "Candle",
        eventType: ERROR_EVENT,
        data: {
          candleId: data.candle.id,
          error
        }
      })
    );
  }
}

module.exports = { handleStart, handleStop, handleUpdate, handleCandle };

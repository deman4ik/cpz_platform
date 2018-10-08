import dayjs from "dayjs";
import VError from "verror";
import {
  ERROR_ADVISER_EVENT,
  TASKS_ADVISER_STARTED_EVENT,
  TASKS_ADVISER_STOPPED_EVENT,
  TASKS_ADVISER_UPDATED_EVENT,
  CANDLES_HANDLED_EVENT
} from "cpzEventTypes";
import { STATUS_STARTED, STATUS_STOPPED, STATUS_BUSY } from "cpzState";
import { createAdviserSlug } from "cpzStorage/utils";
import { TOPICS, publishEvents } from "cpzEvents";
import { ADVISER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { getModeFromSubject } from "cpzUtils/helpers";
import Adviser from "./adviser";
import {
  getAdviserByKey,
  getAdvisersBySlug,
  updateAdviserState,
  savePendingCandles
} from "../tableStorage";
import execute from "./execute";
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
    await publishEvents(context, TOPICS.TASKS, {
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
          eventData.mode
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
    await publishEvents(context, TOPICS.TASKS, {
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
 * Запуск нового советника в режиме бэктеста
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleBacktest(context, eventData) {
  try {
    // Инициализируем класс советника
    const adviser = new Adviser(context, eventData);
    // TODO: режим бэктест
    // Сохраняем состояние
    adviser.end(STATUS_STARTED);
    // Публикуем событие - успех
    await publishEvents(context, TOPICS.TASKS, {
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
          eventData.timeframe
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
        "Failed to start adviser in backtest mode"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, TOPICS.TASKS, {
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
    await publishEvents(context, TOPICS.TASKS, {
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
    await publishEvents(context, TOPICS.TASKS, {
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
      await publishEvents(context, TOPICS.TASKS, {
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
    await publishEvents(context, TOPICS.TASKS, {
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

/**
 * Обработка новой свечи
 *
 * @param {*} context
 * @param {*} candle
 */
async function handleCandle(context, eventData) {
  try {
    const { eventSubject, candle } = eventData;
    const mode = getModeFromSubject(eventSubject);
    // Параметры запроса - биржа + инструмент + таймфрейм
    const slug = createAdviserSlug(
      candle.exchange,
      candle.asset,
      candle.currency,
      candle.timeframe,
      mode
    );
    // Ищем подходящих советников
    const getAdvisersResult = await getAdvisersBySlug(context, slug);
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
        try {
          await execute(context, state, candle);
        } catch (error) {
          return {
            isSuccess: false,
            taskId: state.taskId,
            error: createErrorOutput(error)
          };
        }
        return { isSuccess: true, taskId: state.taskId };
      })
    );

    // Для занятых советников параллельно наполняем свечами очередь на дальнейшую обработку
    const adviserBusyQueueResults = await Promise.all(
      busyAdvisers.map(async state => {
        const newPendingCandle = {
          ...candle,
          taskId: state.taskId
        };
        try {
          await savePendingCandles(newPendingCandle);
        } catch (error) {
          return {
            isSuccess: false,
            taskId: state.taskId,
            error: createErrorOutput(error)
          };
        }
        return { isSuccess: true, taskId: state.taskId };
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
    // Отбираем из не успешных только с ошибкой мутации стореджа
    const concurrentAdvisers = errorAdvisers.filter(adviser =>
      VError.hasCauseWithName(adviser.error, "StorageEntityMutation")
    );
    // Для занятых советников параллельно наполняем свечами очередь на дальнейшую обработку
    const adviserConcurrentQueueResults = await Promise.all(
      concurrentAdvisers.map(async state => {
        const newPendingCandle = {
          ...candle,
          taskId: state.taskId
        };
        try {
          await savePendingCandles(newPendingCandle);
        } catch (error) {
          return {
            isSuccess: false,
            taskId: state.taskId,
            error: createErrorOutput(error)
          };
        }
        return { isSuccess: true, taskId: state.taskId };
      })
    );
    // Список советников для которых есть сообщения в очереди
    const pendingAdvisers = [
      ...adviserBusyQueueResults,
      ...adviserConcurrentQueueResults
    ];
    // Отбираем из результата выполнения только успешные
    const successPendingAdvisers = pendingAdvisers
      .filter(result => result.isSuccess === true)
      .map(result => result.taskId);
    // Отбираем из результата выполнения только не успешные
    const errorPendingAdvisers = pendingAdvisers
      .filter(result => result.isSuccess === false)
      .map(result => ({ taskId: result.taskId, error: result.error }));

    // Публикуем событие - успех
    await publishEvents(context, TOPICS.TASKS, {
      service: ADVISER_SERVICE,
      subject: `${candle.exchange}/${candle.asset}/${candle.currency}/${
        candle.timeframe
      }`,
      eventType: CANDLES_HANDLED_EVENT,
      data: {
        candleId: candle.candleId,
        success: successAdvisers,
        error: errorAdvisers,
        successPending: successPendingAdvisers,
        errorPending: errorPendingAdvisers
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
        "Failed to handle candle"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, TOPICS.ERROR, {
      service: ADVISER_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_ADVISER_EVENT,
      data: {
        candleId: eventData.candle.id,
        error: errorOutput
      }
    });
  }
}

export { handleStart, handleStop, handleUpdate, handleCandle };

import VError from "verror";
import {
  ERROR_ADVISER_EVENT,
  CANDLES_NEWCANDLE_EVENT,
  CANDLES_HANDLED_EVENT,
  TASKS_TOPIC,
  ERROR_TOPIC
} from "cpzEventTypes";
import { STATUS_STARTED, STATUS_BUSY } from "cpzState";
import { createAdviserSlug } from "cpzStorage/utils";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { ADVISER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { subjectToStr } from "cpzUtils/helpers";
import { getAdvisersBySlug, savePendingCandles } from "../tableStorage";
import execute from "./execute";

const validateNewCandle = createValidator(CANDLES_NEWCANDLE_EVENT.dataSchema);
/**
 * Обработка новой свечи
 *
 * @param {*} context
 * @param {*} candle
 */
async function handleCandle(context, eventData) {
  try {
    const { eventSubject, candle } = eventData;
    const modeStr = subjectToStr(eventSubject);
    context.log(modeStr);
    // Валидация входных параметров
    genErrorIfExist(validateNewCandle(eventData.candle));
    // Параметры запроса - биржа + инструмент + таймфрейм
    const slug = createAdviserSlug(
      candle.exchange,
      candle.asset,
      candle.currency,
      candle.timeframe,
      modeStr
    );
    context.log(slug);
    // Ищем подходящих советников
    const getAdvisersResult = await getAdvisersBySlug(slug);
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
    await publishEvents(context, TASKS_TOPIC, {
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
    await publishEvents(context, ERROR_TOPIC, {
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

export default handleCandle;

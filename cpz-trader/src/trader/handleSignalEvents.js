import VError from "verror";
import {
  ERROR_TRADER_EVENT,
  SIGNALS_NEWSIGNAL_EVENT,
  SIGNALS_HANDLED_EVENT,
  SIGNALS_TOPIC,
  ERROR_TOPIC
} from "cpzEventTypes";
import { STATUS_STARTED, STATUS_BUSY } from "cpzState";
import { createTraderSlug } from "cpzStorage/utils";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { TRADER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { subjectToStr } from "cpzUtils/helpers";
import { getTradersBySlug, savePendingSignal } from "../tableStorage";
import execute from "./execute";

const validateNewCandle = createValidator(SIGNALS_NEWSIGNAL_EVENT.dataSchema);
/**
 * Обработка нового сигнала
 *
 * @param {*} context
 * @param {*} signal
 */
async function handleSignal(context, eventData) {
  try {
    const { eventSubject, signal } = eventData;
    const modeStr = subjectToStr(eventSubject);
    context.log(modeStr);
    // Валидация входных параметров
    genErrorIfExist(validateNewCandle(signal));
    // Параметры запроса - биржа + инструмент + таймфрейм
    const slug = createTraderSlug(
      signal.exchange,
      signal.asset,
      signal.currency,
      signal.timeframe,
      modeStr
    );
    context.log(slug);
    // Ищем подходящих проторговщиков
    const traders = await getTradersBySlug(slug);
    // Фильтруем только доступные проторговщики
    const startedTraders = traders.filter(
      adviser => adviser.status === STATUS_STARTED
    );
    // Фильтруем только занятые проторговщики
    const busyTraders = traders.filter(
      adviser => adviser.status === STATUS_BUSY
    );
    // Запускаем параллельно всех доступных проторговщиков в работу
    const traderExecutionResults = await Promise.all(
      startedTraders.map(async state => {
        try {
          await execute(context, state, signal);
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

    // Для занятых проторговщиков параллельно наполняем свечами очередь на дальнейшую обработку
    const traderBusyQueueResults = await Promise.all(
      busyTraders.map(async state => {
        const newPendingSignal = {
          ...signal,
          taskId: state.taskId
        };
        try {
          await savePendingSignal(newPendingSignal);
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
    const successTaders = traderExecutionResults
      .filter(result => result.isSuccess === true)
      .map(result => result.taskId);
    // Отбираем из результата выполнения только не успешные
    const errorTraders = traderExecutionResults
      .filter(result => result.isSuccess === false)
      .map(result => ({ taskId: result.taskId, error: result.error }));
    // Отбираем из не успешных только с ошибкой мутации стореджа
    const concurrentTraders = errorTraders.filter(trader =>
      VError.hasCauseWithName(trader.error, "StorageEntityMutation")
    );
    // Для занятых проторговщиков параллельно наполняем свечами очередь на дальнейшую обработку
    const traderConcurrentQueueResults = await Promise.all(
      concurrentTraders.map(async state => {
        const newPendingSignal = {
          ...signal,
          taskId: state.taskId
        };
        try {
          await savePendingSignal(newPendingSignal);
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
    // Список проторговщиков для которых есть сообщения в очереди
    const pendingTraders = [
      ...traderBusyQueueResults,
      ...traderConcurrentQueueResults
    ];
    // Отбираем из результата выполнения только успешные
    const successPendingTraders = pendingTraders
      .filter(result => result.isSuccess === true)
      .map(result => result.taskId);
    // Отбираем из результата выполнения только не успешные
    const errorPendingTraders = pendingTraders
      .filter(result => result.isSuccess === false)
      .map(result => ({ taskId: result.taskId, error: result.error }));

    // Публикуем событие - успех
    await publishEvents(context, SIGNALS_TOPIC, {
      service: TRADER_SERVICE,
      subject: `${signal.exchange}/${signal.asset}/${signal.currency}/${
        signal.timeframe
      }`,
      eventType: SIGNALS_HANDLED_EVENT,
      data: {
        signalId: signal.signalId,
        success: successTaders,
        error: errorTraders,
        successPending: successPendingTraders,
        errorPending: errorPendingTraders
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
        "Failed to handle signal"
      )
    );
    context.log.error(errorOutput.message, errorOutput);
    // Публикуем событие - ошибка
    await publishEvents(context, ERROR_TOPIC, {
      service: TRADER_SERVICE,
      subject: eventData.eventSubject,
      eventType: ERROR_TRADER_EVENT,
      data: {
        signalId: eventData.signal.signalId,
        error: errorOutput
      }
    });
  }
}

export default handleSignal;

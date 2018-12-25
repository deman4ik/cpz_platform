import VError from "verror";
import {
  ERROR_TRADER_EVENT,
  SIGNALS_NEWSIGNAL_EVENT,
  SIGNALS_HANDLED_EVENT,
  SIGNALS_TOPIC,
  TRADES_TOPIC,
  ERROR_TOPIC
} from "cpzEventTypes";
import {
  STATUS_STARTED,
  STATUS_BUSY,
  STATUS_ERROR,
  STATUS_STOPPED,
  createTraderSlug
} from "cpzState";
import { createValidator, genErrorIfExist } from "cpzUtils/validation";
import publishEvents from "cpzEvents";
import { TRADER_SERVICE } from "cpzServices";
import { createErrorOutput } from "cpzUtils/error";
import { subjectToStr } from "cpzUtils/helpers";
import {
  getActiveTradersBySlug,
  getTraderById,
  savePendingSignal,
  getPendingSignalsByTraderId,
  deletePendingSignal
} from "cpzStorage";
import Trader from "./trader";

const validateNewCandle = createValidator(SIGNALS_NEWSIGNAL_EVENT.dataSchema);

/**
 * Обработка сигнала проторговщиком
 *
 * @param {*} context
 * @param {*} state
 * @param {*} signal
 * @param {boolean} child признак вызовая функции повторно
 */
async function execute(context, state, signal, child = false) {
  let trader;
  try {
    // Создаем экземпляр класса
    trader = new Trader(context, state);
    // Если задача остановлена
    if (trader.status === STATUS_STOPPED || trader.status === STATUS_ERROR) {
      // Сохраняем состояние и завершаем работу
      trader.end(trader.status);

      return;
    }
    // Если есть запрос на обновление параметров
    if (trader.updateRequested) {
      // Обновляем параметры
      trader.setUpdate();
    }
    // Устанавливаем статус "Занят"
    trader.status = STATUS_BUSY;
    await trader.save();
    // Обработка нового сигнала
    await trader.handleSignal(signal);

    // Если есть хотя бы одно событие для отправка
    if (trader.events.length > 0) {
      // Отправляем
      await publishEvents(TRADES_TOPIC, trader.events);
    }
    // Завершаем работу и сохраняем стейт
    await trader.end(STATUS_STARTED);
    // Логируем итерацию
    const currentState = trader.getCurrentState();
    await trader.logEvent(currentState);
    // Если это основной вызов
    if (!child) {
      // Проверяем ожидающие обработку свечи
      await handlePendingSignals(context, {
        traderId: state.RowKey
      });
    }
  } catch (error) {
    const err = new VError(
      {
        name: "TraderHandleSignalError",
        cause: error,
        info: {
          state,
          signal
        }
      },
      'Failed to execute trader taskId: "%s"',
      state.taskId
    );
    const errorOutput = createErrorOutput(err);
    context.log.error(errorOutput.message, errorOutput);
    // Если есть экземпляр класса
    if (trader) {
      // По умолчанию продолжаем работу после ошибки
      let status = STATUS_STARTED;
      // Если была аварийная остановка - устанавливаем статус ошибка
      if (VError.hasCauseWithName(err, "TraderCrashError"))
        status = STATUS_ERROR;
      // Сохраняем ошибку в сторедже
      await trader.end(status, errorOutput);
    }
  }
}

/**
 * Обработка ожидающих обработки сигналов
 *
 * @param {*} taskId
 */
async function handlePendingSignals(context, { traderId }) {
  // Считываем не обработанные сигналы
  const pendingSignals = getPendingSignalsByTraderId(traderId);
  /* eslint-disable no-restricted-syntax */
  for (const pendingSignal of pendingSignals) {
    /* eslint-disable no-await-in-loop */
    // Считываем текущее состояние проторговщика
    const traderState = await getTraderById(traderId);
    // Начинаем обработку
    await execute(context, traderState, pendingSignal, true);
    // Удаляем свечу из очереди
    await deletePendingSignal(pendingSignal);
    /*  no-await-in-loop */
  }
  /*  no-restricted-syntax */
}

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
    // Ищем подходящих проторговщиков
    const traders = await getActiveTradersBySlug(
      createTraderSlug({
        exchange: signal.exchange,
        asset: signal.asset,
        currency: signal.currency,
        timeframe: signal.timeframe,
        robotId: signal.robotId,
        modeStr
      })
    );
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
          taskId: state.taskId,
          PartitionKey: state.taskId,
          RowKey: state.signalId.toString()
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
          taskId: state.taskId,
          PartitionKey: state.taskId,
          RowKey: state.signalId.toString()
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
    await publishEvents(SIGNALS_TOPIC, {
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
    await publishEvents(ERROR_TOPIC, {
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

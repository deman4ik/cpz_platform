import VError from "verror";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_BUSY,
  STATUS_ERROR
} from "cpzState";
import publishEvents from "cpzEvents";
import { SIGNALS_TOPIC, LOG_TOPIC } from "cpzEventTypes";
import { createErrorOutput } from "cpzUtils/error";
import {
  getPendingCandlesByAdviserId,
  getAdviserById,
  deletePendingCandle
} from "cpzStorage";
import Adviser from "./adviser";

/**
 * Основная задача советника
 *
 * @param {*} context
 * @param {*} state
 * @param {*} candle
 * @param {boolean} child признак вызовая функции повторно
 */
async function execute(context, state, candle, child = false) {
  context.log("execute");
  let adviser;
  try {
    // Создаем экземпляр класса Adviser
    adviser = new Adviser(context, state);
    // Если задача остановлена
    if (adviser.status === STATUS_STOPPED || adviser.status === STATUS_ERROR) {
      // Сохраняем состояние и завершаем работу
      adviser.end(adviser.status);

      return;
    }
    // Если есть запрос на обновление параметров
    if (adviser.updateRequested) {
      // Обновляем параметры
      adviser.setUpdate();
    }
    // Устанавливаем статус "Занят"
    adviser.status = STATUS_BUSY;
    await adviser.save();
    // Обработка новой свечи и запуск стратегии
    await adviser.handleCandle(candle);
    // Если есть хотя бы одно событие для отправка
    if (adviser.signals.length > 0) {
      // Отправляем
      await publishEvents(SIGNALS_TOPIC, adviser.signals);
    }
    if (adviser.logEvents.length > 0) {
      // Отправляем
      await publishEvents(LOG_TOPIC, adviser.logEvents);
    }
    // Завершаем работу и сохраняем стейт
    await adviser.end(STATUS_STARTED);
    // Логируем итерацию
    const currentState = adviser.getCurrentState();
    await adviser.logEvent(currentState);
    // Если это основной вызов
    if (!child) {
      // Проверяем ожидающие обработку свечи
      await handlePendingCandles(context, state.taskId);
    }
  } catch (error) {
    const err = new VError(
      {
        name: "AdviserExecutionError",
        cause: error,
        info: {
          state,
          candle
        }
      },
      'Failed to execute adviser taskId: "%s"',
      state.taskId
    );
    const errorOutput = createErrorOutput(err);
    context.log.error(errorOutput.message, errorOutput);
    // Если есть экземпляр класса
    if (adviser) {
      // По умолчанию продолжаем работу после ошибки
      let status = STATUS_STARTED;
      // Если была аварийная остановка - устанавливаем статус ошибка
      if (VError.hasCauseWithName(err, "AdviserCrashError"))
        status = STATUS_ERROR;
      // Сохраняем ошибку в сторедже
      await adviser.end(status, errorOutput);
    }
  }
}

/**
 * Обработка ожидающих обработки свечей
 *
 * @param {*} taskId
 */
async function handlePendingCandles(context, taskId) {
  // Считываем не обработанные свечи
  const pendingCandles = getPendingCandlesByAdviserId(taskId);
  if (pendingCandles && pendingCandles.length > 0) {
    /* eslint-disable no-restricted-syntax */
    for (const pendingCandle of pendingCandles) {
      /* eslint-disable no-await-in-loop */
      // Считываем текущее состояние советника
      const adviserState = await getAdviserById(taskId);
      // Начинаем обработку
      await execute(context, adviserState, pendingCandle, true);
      // Удаляем свечу из очереди
      await deletePendingCandle(pendingCandle);
      /* no-await-in-loop */
    }
    /*  no-restricted-syntax */
  }
}

export default execute;

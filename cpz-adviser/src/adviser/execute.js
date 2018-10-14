import VError from "verror";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_BUSY,
  STATUS_ERROR
} from "cpzState";
import publishEvents from "cpzEvents";
import { SIGNALS_TOPIC } from "cpzEventTypes";
import { createErrorOutput } from "cpzUtils/error";
import Adviser from "./adviser";
/**
 * Основная задача советника
 *
 * @param {*} context
 * @param {*} state
 * @param {*} candle
 */
async function execute(context, state, candle) {
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
    if (adviser.events.length > 0) {
      // Отправляем
      await publishEvents(context, SIGNALS_TOPIC, adviser.events);
    }
    // Завершаем работу и сохраняем стейт
    await adviser.end(STATUS_STARTED);
    // Логируем итерацию
    await adviser.logEvent(adviser.getCurrentState());
    //! TODO  Считывание и обработка Pending Candles
    return;
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
      if (VError.hasCauseWithName(err, "AdviserCrachError"))
        status = STATUS_ERROR;
      // Сохраняем ошибку в сторедже
      await adviser.end(status, errorOutput);
    }
    throw err;
  }
}

export default execute;

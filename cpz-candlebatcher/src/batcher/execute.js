/*
 * Обработка новой свечи
 */
import VError from "verror";
import { CANDLEBATCHER_SERVICE } from "cpzServices";
import {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_BUSY,
  STATUS_ERROR
} from "cpzState";
import Log from "cpzUtils/log";
import { ERROR_CANDLEBATCHER_EVENT, ERROR_TOPIC } from "cpzEventTypes";
import publishEvents from "cpzEvents";
import { createErrorOutput } from "cpzUtils/error";
import Candlebatcher from "./candlebatcher";

async function execute(context, state) {
  let candlebatcher;
  try {
    // Создаем экземпляр класса Candlebatcher
    candlebatcher = new Candlebatcher(context, state);
    // Если задача остановлена
    if (
      candlebatcher.status === STATUS_STOPPED ||
      candlebatcher.status === STATUS_ERROR
    ) {
      // Сохраняем состояние и завершаем работу
      candlebatcher.end(candlebatcher.status);
      return;
    }
    // Если есть запрос на обновление параметров
    if (candlebatcher.updateRequested) {
      // Обновляем параметры
      candlebatcher.setUpdate();
    }
    // Устанавливаем статус "Занят"
    candlebatcher.status = STATUS_BUSY;
    await candlebatcher.save();

    // Формируем новые свечи
    await candlebatcher.handleCandle();

    // Завершаем работу и сохраняем стейт
    await candlebatcher.end(STATUS_STARTED);
    // Логируем итерацию
    // await candlebatcher.logEvent(candlebatcher.getCurrentState());
  } catch (error) {
    const errorOutput = createErrorOutput(
      new VError(
        {
          name: "CandlebatcherError",
          cause: error
        },
        "Failed to execute candlebatcher"
      )
    );

    // Если есть экземпляр класса
    if (candlebatcher) {
      // Сохраняем ошибку в сторедже и продолжаем работу
      await candlebatcher.end(STATUS_STARTED, errorOutput);
    } else {
      Log.error(errorOutput);
    }
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: CANDLEBATCHER_SERVICE,
      subject: "CandlebatcherTimerError",
      eventType: ERROR_CANDLEBATCHER_EVENT,
      data: {
        taskId: state.taskId,
        error: {
          name: errorOutput.name,
          message: errorOutput.message,
          info: errorOutput.info
        }
      }
    });
  }
}
export default execute;

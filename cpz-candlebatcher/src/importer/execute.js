/*
 * Обработка очередной итерации импорта
 */
import { VError } from "verror";
import { IMPORTER_SERVICE } from "cpzServices";
import {
  ERROR_IMPORTER_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_TOPIC,
  ERROR_TOPIC
} from "cpzEventTypes";
import publishEvents from "cpzEvents";
import {
  STATUS_STOPPED,
  STATUS_ERROR,
  STATUS_STARTED,
  STATUS_FINISHED
} from "cpzState";
import { createErrorOutput } from "cpzUtils/error";
import Importer from "./importer";

async function execute(context, state, start = false) {
  context.log.info(`Starting Importer ${state.taskId} execution...`);
  let importer;
  try {
    // Создаем экземпляр класса Candlebatcher
    importer = new Importer(context, state);
    // Если задача остановлена
    if (
      importer.status === STATUS_STOPPED ||
      importer.status === STATUS_ERROR
    ) {
      // Сохраняем состояние и завершаем работу
      importer.end(importer.status);
      return;
    }

    // Устанавливаем статус "Занят"
    importer.status = STATUS_STARTED;
    await importer.save();
    if (start) {
      // Публикуем событие - успех
      await publishEvents(TASKS_TOPIC, {
        service: IMPORTER_SERVICE,
        subject: state.eventSubject,
        eventType: TASKS_IMPORTER_STARTED_EVENT,
        data: {
          taskId: state.taskId
        }
      });
    }
    if (!importer.loaded) {
      // Загружаем новые свечи
      await importer.loadCandles();

      // Сохраняем загруженные свечи
      await importer.saveCandlesToTemp();
    }
    if (importer.loaded) {
      // Если импорт завершен
      //  Проверяем пропуски, сворачиваем свечи, сохраняем в БД, очищаем кэш
      await importer.finalize();

      if (importer.saved) {
        // Завершаем работу и сохраняем стейт
        await importer.end(STATUS_FINISHED);
      }
    }

    if (!importer.loaded || !importer.saved) {
      // Если импорт не завершен, добавляем новую задачу в очередь
      await importer.queueNext();
      // Завершаем работу и сохраняем стейт
      await importer.end(STATUS_STARTED);
    }

    // Логируем итерацию
    await importer.logEvent(importer.getCurrentState());
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
    context.log.error(errorOutput.message, errorOutput);
    // Если есть экземпляр класса
    if (importer) {
      // Сохраняем ошибку в сторедже
      await importer.end(STATUS_ERROR, errorOutput);
    }
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: IMPORTER_SERVICE,
      subject: state.eventSubject,
      eventType: ERROR_IMPORTER_EVENT,
      data: {
        taskId: state.taskId,
        errorOutput
      }
    });
    // Передаем ошибку в рантайм, чтобы попробовать отработать сообщение в очереди
    throw error;
  }
  context.log.info(`Finished Importer ${state.taskId} execution.`);
}
export default execute;

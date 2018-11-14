/*
 * Обработка очередной итерации импорта
 */
import { IMPORTER_SERVICE } from "cpzServices";
import {
  ERROR_IMPORTER_EVENT,
  TASKS_IMPORTER_STARTED_EVENT,
  TASKS_TOPIC,
  ERROR_TOPIC
} from "cpzEventTypes";
import publishEvents from "cpzEvents";
import { createCandlebatcherSlug } from "cpzStorage/utils";
import { modeToStr } from "cpzUtils/helpers";
import {
  STATUS_STOPPED,
  STATUS_ERROR,
  STATUS_STARTED,
  STATUS_FINISHED
} from "cpzState";
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
          service: IMPORTER_SERVICE,
          taskId: state.taskId,
          rowKey: state.rowKey,
          partitionKey: createCandlebatcherSlug(
            state.exchange,
            state.asset,
            state.currency,
            modeToStr(state.mode)
          )
        }
      });
    }
    // Загружаем новые свечи
    await importer.loadCandles();

    // Сохраняем загруженные свечи
    await importer.saveCandlesToTemp();

    // Если импорт завершен
    if (importer.finished) {
      //  Проверяем пропуски, сворачиваем свечи, сохраняем в БД, очищаем кэш
      await importer.finalize();
      // Завершаем работу и сохраняем стейт
      await importer.end(STATUS_FINISHED);
    } else {
      // Если импорт не завершен, добавляем новую задачу в очередь
      await importer.queueNext();
      // Завершаем работу и сохраняем стейт
      await importer.end(STATUS_STARTED);
    }

    // Логируем итерацию
    await importer.logEvent(importer.getCurrentState());
  } catch (error) {
    // Все необработанные ошибки
    context.log.error(error);
    // Если есть экземпляр класса
    if (importer) {
      // Сохраняем ошибку в сторедже
      await importer.end(STATUS_ERROR, error);
    }
    // Публикуем событие - ошибка
    await publishEvents(ERROR_TOPIC, {
      service: IMPORTER_SERVICE,
      subject: state.eventSubject,
      eventType: ERROR_IMPORTER_EVENT,
      data: {
        taskId: state.taskId,
        error
      }
    });
    // Передаем ошибку в рантайм, чтобы попробовать отработать сообщение в очереди
    throw error;
  }
  context.log.info(`Finished Importer ${state.taskId} execution.`);
}
export default execute;

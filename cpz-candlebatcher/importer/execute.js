/*
 * Обработка очередной итерации импорта
 */
const Importer = require("./importer");
const retry = require("../utils/retry");
const {
  IMPORTER_SERVICE,
  STATUS_STOPPED,
  STATUS_ERROR,
  STATUS_BUSY,
  ERROR_EVENT,
  TASKS_CANDLEBATCHER_STARTEDIMPORT_EVENT
} = require("../config");
const { publishEvents, createEvents } = require("../eventgrid");
const { createSlug } = require("../tableStorage/utils");

async function execute(context, state, start = false) {
  context.log.info(`Starting Importer ${state.taskId} execution...`);
  let importer;
  try {
    // Создаем экземпляр класса Candlebatcher
    importer = new Importer(context, state);
    // Если задача остановлена
    if (
      importer.getStatus() === STATUS_STOPPED ||
      importer.getStatus() === STATUS_ERROR
    ) {
      // Сохраняем состояние и завершаем работу
      importer.end();
      return;
    }
    // Устанавливаем статус "Занят"
    importer.setStatus(STATUS_BUSY);
    await importer.save();
    if (start) {
      // Публикуем событие - успех
      await publishEvents(
        context,
        "tasks",
        createEvents({
          subject: state.eventSubject,
          eventType: TASKS_CANDLEBATCHER_STARTEDIMPORT_EVENT,
          data: {
            service: IMPORTER_SERVICE,
            taskId: state.taskId,
            rowKey: state.rowKey,
            partitionKey: createSlug(
              state.exchange,
              state.asset,
              state.currency
            )
          }
        })
      );
    }
    // Загружаем новые свечи
    const loadCandlesFunc = importer.loadCandles.bind(importer);
    await retry(loadCandlesFunc);
    // Сохраняем новую загруженную свечу
    const saveCandlesFunc = importer.saveCandles.bind(importer);
    await retry(saveCandlesFunc);
    // Если импорт не завершен, добавляем новую задачу в очередь
    const queueNextFunc = importer.queueNext.bind(importer);
    await retry(queueNextFunc);
    // Завершаем работу и сохраняем стейт
    await importer.end();
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
    await publishEvents(
      context,
      "log",
      createEvents({
        subject: state.eventSubject,
        eventType: ERROR_EVENT,
        data: {
          service: IMPORTER_SERVICE,
          taskId: state.taskId,
          error
        }
      })
    );
    // Передаем ошибку в рантайм, чтобы попробовать отработать сообщение в очереди
    throw error;
  }
  context.log.info(`Finished Importer ${state.taskId} execution.`);
}
module.exports = execute;

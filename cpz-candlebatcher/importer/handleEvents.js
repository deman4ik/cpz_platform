const execute = require("./execute");
const { updateImporterState } = require("../tableStorage");
const {
  TASKS_CANDLEBATCHER_STOPPPEDIMPORT_EVENT,
  IMPORTER_SERVICE
} = require("../config");
const { publishEvents, createEvents } = require("../eventgrid");

/**
 * Запуск нового импортера свечей
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleImportStart(context, eventData) {
  // TODO: Проверка входных параметров
  await execute(context, eventData, true);
}
/**
 * Остановка импорта
 *
 * @param {*} context
 * @param {*} eventData
 */
async function handleImportStop(context, eventData) {
  try {
    const newState = {
      RowKey: eventData.rowKey,
      PartitionKey: eventData.partitionKey,
      stopRequested: true
    };
    const result = await updateImporterState(context, newState);
    if (!result.isSuccess)
      throw new Error(`Can't update Importer state\n${result.error}`);
    // Публикуем событие - успех
    await publishEvents(
      context,
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_CANDLEBATCHER_STOPPPEDIMPORT_EVENT,
        data: {
          service: IMPORTER_SERVICE,
          taskId: eventData.taskId
        }
      })
    );
  } catch (error) {
    context.log.error(error, eventData);
    // Публикуем событие - ошибка
    await publishEvents(
      context,
      "tasks",
      createEvents({
        subject: eventData.eventSubject,
        eventType: TASKS_CANDLEBATCHER_STOPPPEDIMPORT_EVENT,
        data: {
          service: IMPORTER_SERVICE,
          taskId: eventData.taskId,
          error
        }
      })
    );
  }
}

module.exports = { handleImportStart, handleImportStop };

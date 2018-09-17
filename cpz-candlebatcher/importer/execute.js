/*
 * Обработка очередной итерации импорта
 */
const Importer = require("./importer");
const retry = require("../utils/retry");
const publishEvents = require("../eventgrid/publish");

async function execute(context, state) {
  context.log.info(`Starting Importer ${state.taskId} execution...`);
  let importer;
  try {
    // Создаем экземпляр класса Candlebatcher
    importer = new Importer(context, state);
    // Устанавливаем статус "Занят"
    importer.setStatus("busy");
    await importer.save();
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
  } catch (error) {
    // Все необработанные ошибки
    context.log.error(error);
    // Если есть экземпляр класса
    if (importer) {
      // Сохраняем ошибку в сторедже
      await importer.end(error, "error");
    }
    // TODO: Отправить в Error Log EventGrid
    // Передаем ошибку в рантайм, чтобы попробовать отработать сообщение в очереди
    throw error;
  }
  context.log.info(`Finished Importer ${state.taskId} execution.`);
}
module.exports = execute;

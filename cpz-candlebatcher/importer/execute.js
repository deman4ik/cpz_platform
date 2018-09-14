/*
 * Обработка очередной итерации импорта
 */
const Importer = require("./importer");
const retry = require("../utils/retry");
const publishEvents = require("../eventgrid/publish");

async function execute(context, state) {
  let importer;
  try {
    // Создаем экземпляр класса Candlebatcher
    importer = new Importer(context, state);
    // Устанавливаем статус "Занят"
    importer.setStatus("busy");
    await importer.save();
    // Загружаем новые свечи
    const loadCandlesResult = await retry(importer.loadCandles);
    // Если не удалось загрузить новую свечу
    if (!loadCandlesResult.isSuccess) {
      // выходим с ошибкой
      throw loadCandlesResult;
    }
    // Сохраняем новую загруженную свечу
    const saveCandlesResult = await retry(importer.saveCandles);
    // Если ошибка
    if (!saveCandlesResult.isSuccess) {
      // выходим с ошибкой
      throw saveCandlesResult;
    }

    // Если импорт не завершен, добавляем новую задачу в очередь
    const queueNextResult = await retry(importer.queueNext);
    // Если ошибка
    if (!queueNextResult.isSuccess) {
      // выходим с ошибкой
      throw queueNextResult;
    }

    // Завершаем работу и сохраняем стейт
    await importer.end();
  } catch (error) {
    // Все необработанные ошибки
    this.context.log.error(error, state);
    // Если есть экземпляр класса
    if (importer) {
      // Останавливаем процесс загрузки
      await importer.end(error, "error");
    }
    // TODO: Отправить в Error Log EventGrid
    // Передаем ошибку в рантайм, чтобы попробовать отработать сообщение в очереди
    throw error;
  }
}
module.exports = execute;

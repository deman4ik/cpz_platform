/*
 * Обработка новой свечи
 */

const uuid = require("uuid").v4;
const Candlebatcher = require("./candlebatcher");
const retry = require("../utils/retry");
const publishEvents = require("../eventgrid/publish");

async function execute(context, state) {
  let candlebatcher;
  try {
    // Создаем экземпляр класса Candlebatcher
    candlebatcher = new Candlebatcher(context, state);
    // Устанавливаем статус "Занят"
    candlebatcher.setStatus("busy");
    await candlebatcher.save();
    // Загружаем новую минутную свечу
    const loadCandleResult = await retry(candlebatcher.loadCandle);
    // Если не удалось загрузить новую свечу
    if (!loadCandleResult.isSuccess) {
      // TODO: Отправить в Error Log EventGrid
      // пропускаем итерацию
      await candlebatcher.end();
      return;
    }
    // Сохраняем новую загруженную свечу
    const saveCandleResult = await retry(candlebatcher.saveCandle);
    // Если ошибка
    if (!saveCandleResult.isSuccess) {
      // Если необходима подргрузка данных
      if (saveCandleResult.importRequested) {
        // TODO: start import
      } else {
        // TODO: Отправить в Error Log EventGrid
        // пропускаем итерацию
        await candlebatcher.end();
        return;
      }
    }
    // Генерируем события для отправки
    const eventsToSend = await candlebatcher.getEvents();
    // Если есть хотя бы одно событие
    if (eventsToSend.length > 0) {
      // Отправляем
      const publishEventsResult = await publishEvents(
        this.context,
        "candles",
        eventsToSend
      );
      // Если не удалось отправить события
      if (!publishEventsResult.isSuccess) {
        // TODO: Отправить в Error Log EventGrid
      }
    }

    // Завершаем работу и сохраняем стейт
    await candlebatcher.end();
  } catch (error) {
    // Все необработанные ошибки
    this.context.log.error(error, state);
    // Если есть экземпляр класса
    if (candlebatcher) {
      // Останавливаем процесс загрузки
      await candlebatcher.end(error, "error");
    }
    // TODO: Отправить в Error Log EventGrid
  }
}
module.exports = execute;

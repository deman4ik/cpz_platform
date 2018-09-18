/*
 * Обработка новой свечи
 */

const uuid = require("uuid").v4;
const Candlebatcher = require("./candlebatcher");
const retry = require("../utils/retry");
const publishEvents = require("../eventgrid/publish");
const executeImport = require("../importer/execute");

async function execute(context, state) {
  let candlebatcher;
  try {
    // Создаем экземпляр класса Candlebatcher
    candlebatcher = new Candlebatcher(context, state);
    // Если задача остановлена
    if (candlebatcher.getStatus() === "stopped") {
      // Сохраняем состояние и завершаем работу
      candlebatcher.end();
      return;
    }
    // Если есть запрос на обновление параметров
    if (candlebatcher.getUpdateRequested()) {
      // Обновляем параметры
      candlebatcher.setUpdate();
    }
    // Устанавливаем статус "Занят"
    candlebatcher.setStatus("busy");
    await candlebatcher.save();
    // Загружаем новую минутную свечу
    const loadCandleFunc = candlebatcher.loadCandle.bind(candlebatcher);
    const loadCandleResult = await retry(loadCandleFunc);
    // Если не удалось загрузить новую свечу
    if (!loadCandleResult.isSuccess) {
      throw loadCandleResult;
    }
    // Сохраняем новую загруженную свечу
    const saveCandleFunc = candlebatcher.saveCandle.bind(candlebatcher);
    let saveCandleResult = await retry(saveCandleFunc);
    // Если ошибка
    if (!saveCandleResult.isSuccess) {
      // Если необходима подгрузка данных
      if (saveCandleResult.importRequested) {
        const importRequest = {
          ...saveCandleResult,
          taskId: uuid()
        };
        await executeImport(context, importRequest);
        // Пробуем сохранить еще раз
        saveCandleResult = await retry(saveCandleFunc);
        if (!saveCandleResult.isSuccess) {
          // TODO: Отправить в Error Log EventGrid
          // пропускаем итерацию
          await candlebatcher.end();
          return;
        }
      } else {
        throw saveCandleResult;
      }
    }
    // Генерируем события для отправки
    const eventsToSend = await candlebatcher.getEvents();
    // Если есть хотя бы одно событие
    if (eventsToSend.length > 0) {
      // Отправляем
      const publishEventsResult = await publishEvents(
        context,
        "candles",
        eventsToSend
      );
      // Если не удалось отправить события
      if (!publishEventsResult.isSuccess) {
        throw publishEventsResult;
      }
    }

    // Завершаем работу и сохраняем стейт
    await candlebatcher.end();
  } catch (error) {
    // Все необработанные ошибки
    context.log.error(error, state);
    // Если есть экземпляр класса
    if (candlebatcher) {
      // Сохраняем ошибку в сторедже
      await candlebatcher.end(error);
    }
    // TODO: Отправить в Error Log EventGrid
  }
}
module.exports = execute;

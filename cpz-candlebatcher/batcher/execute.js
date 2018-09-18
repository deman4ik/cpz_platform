/*
 * Обработка новой свечи
 */

const uuid = require("uuid").v4;
const Candlebatcher = require("./candlebatcher");
const {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_BUSY,
  STATUS_ERROR,
  ERROR_EVENT
} = require("../config");
const retry = require("../utils/retry");
const { publishEvents, createEvents } = require("../eventgrid");
const executeImport = require("../importer/execute");

async function execute(context, state) {
  let candlebatcher;
  try {
    // Создаем экземпляр класса Candlebatcher
    candlebatcher = new Candlebatcher(context, state);
    // Если задача остановлена
    if (
      candlebatcher.getStatus() === STATUS_STOPPED ||
      candlebatcher.getStatus() === STATUS_ERROR
    ) {
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
    candlebatcher.setStatus(STATUS_BUSY);
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
          // пропускаем итерацию
          await candlebatcher.end(STATUS_STARTED, saveCandleResult.error);
          // Публикуем событие - ошибка
          await publishEvents(
            context,
            "log",
            createEvents({
              subject: state.eventSubject,
              eventType: ERROR_EVENT,
              data: {
                taskId: state.taskId,
                error: saveCandleResult.error
              }
            })
          );
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
    await candlebatcher.end(STATUS_STARTED);
    // Логируем итерацию
    await candlebatcher.logEvent(candlebatcher.getCurrentState());
  } catch (error) {
    // Все необработанные ошибки
    context.log.error(error, state);
    // Если есть экземпляр класса
    if (candlebatcher) {
      // Сохраняем ошибку в сторедже и продолжаем работу
      await candlebatcher.end(STATUS_STARTED, error);
    }
    // Публикуем событие - ошибка
    await publishEvents(
      context,
      "log",
      createEvents({
        subject: state.eventSubject,
        eventType: ERROR_EVENT,
        data: {
          taskId: state.taskId,
          error
        }
      })
    );
  }
}
module.exports = execute;

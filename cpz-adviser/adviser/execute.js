const Adviser = require("./adviser");
const {
  STATUS_STARTED,
  STATUS_STOPPED,
  STATUS_BUSY,
  STATUS_ERROR
} = require("../config");
const { publishEvents } = require("../eventgrid");

/**
 * Основная задача советника
 *
 * @param {*} context
 * @param {*} state
 * @param {*} candle
 */
async function execute(context, state, candle) {
  context.log("execute");
  let adviser;
  try {
    // Создаем экземпляр класса Adviser
    adviser = new Adviser(context, state);
    // Если задача остановлена
    if (
      adviser.getStatus() === STATUS_STOPPED ||
      adviser.getStatus() === STATUS_ERROR
    ) {
      // Сохраняем состояние и завершаем работу
      adviser.end();
      return { isSuccess: true, taskId: state.taskId };
    }
    // Если есть запрос на обновление параметров
    if (adviser.getUpdateRequested()) {
      // Обновляем параметры
      adviser.setUpdate();
    }
    // Устанавливаем статус "Занят"
    adviser.setStatus(STATUS_BUSY);
    await adviser.save();
    // Обработка новой свечи и запуск стратегии
    adviser.handleCandle(candle);
    // Запрашиваем события для отправки
    const eventsToSend = await adviser.getEvents();
    // Если есть хотя бы одно событие
    if (eventsToSend.length > 0) {
      // Отправляем
      const publishEventsResult = await publishEvents(
        context,
        "signals",
        eventsToSend
      );
      // Если не удалось отправить события
      if (!publishEventsResult.isSuccess) {
        throw publishEventsResult;
      }
    }
    // Завершаем работу и сохраняем стейт
    await adviser.end(STATUS_STARTED);
    // Логируем итерацию
    await adviser.logEvent(adviser.getCurrentState());
    return { isSuccess: true, taskId: state.taskId };
  } catch (error) {
    context.log.error(error, state.taskId);
    // Если есть экземпляр класса
    if (adviser) {
      // Сохраняем ошибку в сторедже и продолжаем работу
      await adviser.end(STATUS_STARTED, error);
    }
    return { isSuccess: false, taskId: state.taskId, error: error.message };
  }
}

module.exports = execute;

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
    if (adviser.status === STATUS_STOPPED || adviser.status === STATUS_ERROR) {
      // Сохраняем состояние и завершаем работу
      adviser.end(adviser.status);

      return { isSuccess: true, taskId: state.taskId };
    }
    // Если есть запрос на обновление параметров
    if (adviser.updateRequested) {
      // Обновляем параметры
      adviser.setUpdate();
    }
    // Устанавливаем статус "Занят"
    adviser.status = STATUS_BUSY;
    await adviser.save();
    // Обработка новой свечи и запуск стратегии
    await adviser.handleCandle(candle);
    // Если есть хотя бы одно событие для отправка
    if (adviser.events.length > 0) {
      // Отправляем
      const publishEventsResult = await publishEvents(
        context,
        "signals",
        adviser.events
      );
      // Если не удалось отправить события
      if (!publishEventsResult.isSuccess) {
        throw publishEventsResult;
      }
    }
    // Завершаем работу и сохраняем стейт
    await adviser.end(STATUS_STARTED);
    // Логируем итерацию
    await adviser.logEvent(adviser.currentState);
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

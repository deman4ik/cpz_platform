const Robot = require("./robot");
/**
 * Основная задача робота
 *
 * @param {*} context
 * @param {*} state
 * @param {*} candle
 */
async function execute(context, state, candle) {
  try {
    context.log("Executing...");
    // Инициализация класса робота с текущим состоянием
    const robot = new Robot(context, state);
    // Новая свеча
    robot.handleCandle(candle);
    // Вычисление индикаторов
    // TODO: robot.calcIndicators();
    // Запуск стратегии
    await robot.stretegyFunc();
    return { isSuccessful: true };
  } catch (error) {
    context.log(error);
    return { isSuccessful: false, state, error: error.message };
  }
}

module.exports = execute;

const Robot = require("./robot");
/**
 * Основная задача робота
 *
 * @param {*} context
 * @param {*} state
 */
async function execute(context, state) {
  try {
    // Инициализация класса робота с текущим состоянием
    const robot = new Robot(context, state);
    // Вычисление индикаторов
    // TODO: robot.calcIndicators();
    // Запуск стратегии
    robot.stretegyFunc();
    return { isSuccessful: true };
  } catch (error) {
    context.log(error);
    return { isSuccessful: false, state, error: error.message };
  }
}

module.exports = execute;

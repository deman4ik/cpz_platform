const Robot = require("../robots/robot");
const { saveState } = require("../tableStorage");

/**
 * Запуск нового робота
 *
 * @param {*} context
 * @param {*} task
 */
async function handleStart(context, task) {
  context.log("Start");
  // Инициализируем нового робота
  const robot = new Robot(context, task.robot);
  // Сохраняем состояние робота
  const stateSaved = await saveState(context, robot.getCurrentState());
}

module.exports = handleStart;

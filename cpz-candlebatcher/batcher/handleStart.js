const Candlebatcher = require("./candlebatcher");

/**
 * Запуск нового загрузчика свечей
 *
 * @param {*} context
 * @param {*} task
 */
async function handleStart(context, task) {
  try {
    context.log("Start");
    // Инициализируем новый загрузчик
    const candlebatcher = new Candlebatcher(context, task);
    // Сохраняем состояние
    candlebatcher.end();
  } catch (error) {
    context.log.error(error, task);
    // TODO: Отправить в Error Log EventGrid
  }
}

module.exports = handleStart;

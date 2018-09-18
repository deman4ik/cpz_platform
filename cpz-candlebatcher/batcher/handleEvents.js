const Candlebatcher = require("./candlebatcher");
const { getCandlebatcherByKey } = require("../tableStorage");
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
/**
 * Остановка загрузчика свечей
 *
 * @param {*} context
 * @param {*} task
 */
async function handleStop(context, task) {
  try {
    context.log("Stop");
    const getCandlebatcherResult = await getCandlebatcherByKey(context, {
      rowKey: task.rowKey,
      partitionKey: task.partitionKey
    });
    if (getCandlebatcherResult.isSuccess) {
      // Инициализируем класс
      const candlebatcher = new Candlebatcher(
        context,
        getCandlebatcherResult.data
      );
      // Если в работе
      if (candlebatcher.getStatus() === "busy") {
        // Запрашиваем остановку при новой итерации
        candlebatcher.setStopRequested();
        // Сохраняем состояние
        candlebatcher.updateState();
      } else {
        // Останавливаем работу и сохраняем состояние
        candlebatcher.end(null, "stopped");
      }
    } else {
      throw getCandlebatcherResult;
    }
  } catch (error) {
    context.log.error(error, task);
    // TODO: Отправить в Error Log EventGrid
  }
}
/**
 * Обновление параметров загрузчика свечей
 *
 * @param {*} context
 * @param {*} task
 */
async function handleUpdate(context, task) {
  try {
    context.log("Update");
    const getCandlebatcherResult = await getCandlebatcherByKey(context, task);
    if (getCandlebatcherResult.isSuccess) {
      // Инициализируем класс
      const candlebatcher = new Candlebatcher(
        context,
        getCandlebatcherResult.data
      );
      // Если в работе
      if (candlebatcher.getStatus() === "busy") {
        // Запрашиваем обновление состояния при новой итерации
        candlebatcher.setUpdateRequested(task);
        // Сохраняем состояние
        candlebatcher.updateState();
      } else {
        // Обновляем параметры и сохраняем состояние
        candlebatcher.setUpdate(task);
      }
    } else {
      throw getCandlebatcherResult;
    }
  } catch (error) {
    context.log.error(error, task);
    // TODO: Отправить в Error Log EventGrid
  }
}

module.exports = { handleStart, handleStop, handleUpdate };

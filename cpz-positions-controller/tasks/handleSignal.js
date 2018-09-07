const { saveState } = require("../tableStorage");

/**
 * Пришел новый сигнал от робота
 *
 * @param {*} context
 * @param {*} signal
 */
async function handleSignal(context, signal) {
  context.log("New signal");
  
  // Обрабатываем сигнал от робота
  
  // Сохраняем сигнал в хранилище
  
}

module.exports = handleSignal;

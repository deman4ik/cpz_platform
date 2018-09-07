const { getState } = require("../tableStorage");

/**
 * Обработка нового тика
 *
 * @param {*} context
 * @param {*} tick
 */
async function handleTick(context, tick) {
  try {
    context.log("Handling tick...");

    // цена тика
    const currentPrice = tick.price;
  
   
  } catch (err) {
    context.log.error(err);
  }
}
module.exports = handleTick;

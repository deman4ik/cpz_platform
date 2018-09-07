const { getState } = require("../tableStorage");
const { createRobotSlug } = require("../robots/utils");

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

    
    context.log(slug);
    
   

  } catch (err) {
    context.log.error(err);
  }
}
module.exports = handleTick;

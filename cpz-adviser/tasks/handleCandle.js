const { getState } = require("../tableStorage");
const { createRobotSlug } = require("../robots/utils");
const executeRobot = require("../robots/execute");
/**
 * Обработка новой свечи
 *
 * @param {*} context
 * @param {*} candle
 */
async function handleCandle(context, candle) {
  try {
    context.log("Handling candle...");

    const slug = createRobotSlug(
      candle.exchange,
      candle.baseq,
      candle.quote,
      candle.timeframe
    );
    const robotsState = await getState(context, slug);

    const results = await Promise.all(
      robotsState.map(async state => {
        const result = await executeRobot(context, state, candle);
        return result;
      })
    );
    // ? Save results/publish event if error
    context.log(results);
    //
    /*
    candle.exchange
    candle.baseq
    candle.quote
    candle.timeframe
    candle.time
    candle.open
    candle.close
    candle.high
    candle.low
    candle.volume
    */
  } catch (err) {
    context.log.error(err);
  }
}
module.exports = handleCandle;

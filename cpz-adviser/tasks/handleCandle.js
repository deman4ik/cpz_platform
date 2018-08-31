const { getState } = require("../tableStorage");
const { createRobotSlug } = require("../robots/utils");

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

    // FIXME: асинхронный цикл
    robotsState.forEach(robot => {
      // FIXME: отдельная функция с промисом
      // Пересчитать индикаторы
    });
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

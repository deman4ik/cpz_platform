/*
 * Обработка новой свечи
 */
const uuid = require("uuid").v4;
const saveCandle = require("./save");
const publishEvents = require("./publishEvent");
const { NEW_CANDLE_EVENT } = require("../utils/constants");

async function handleCandle(context, candle) {
  try {
    context.log("Handling candle...");

    const timeframes = await saveCandle(context, candle);
    const events = [];
    Object.keys(timeframes).forEach(key => {
      const timeframe = timeframes[key];
      if (timeframe !== null || timeframe !== undefined) {
        const timeframeMinutes = key; // TODO: delete "timeframe" string
        const currentDate = new Date();
        const newEvent = {
          id: uuid(),
          subject: `${candle.exchange}#${candle.baseq}/${
            candle.quote
          }#${timeframeMinutes}`,
          dataVersion: "1.0",
          eventTime: currentDate,
          eventType: NEW_CANDLE_EVENT,
          data: {
            exchange: candle.exchange,
            baseq: candle.asset,
            quote: candle.currency,
            timeframe: timeframeMinutes,
            time: candle.end,
            open: candle.open,
            close: candle.close,
            high: candle.high,
            low: candle.low,
            volume: candle.volume
          }
        };
        events.push(newEvent);
      }
    });
    if (events.length > 0) {
      const result = await publishEvents(context, events);
    }
  } catch (err) {
    context.log.error(err);
  }
}

module.exports = handleCandle;

const moment = require("moment");
const ccxt = require("ccxt");
// const promiseRetry = require("promise-retry");

async function LoadOHLC(context, input) {
  context.log("LoadOHLC");
  context.log(input);
  const exchange = new ccxt[input.exchange]({
    enableRateLimit: true
  });
  const symbol = `${input.baseq}/${input.quote}`;
  const candles = await exchange.fetchOHLCV(
    symbol,
    input.timeframe,
    +moment(input.dateFrom)
  );
  /* const candles = await promiseRetry(
    retry =>
      exchange
        .fetchOHLCV(symbol, input.timeframe, +moment(input.dateFrom))
        .catch(retry),
    {
      retries: 5,
      factor: 3,
      minTimeout: exchange.rateLimit
    }
  ); */
  if (candles && candles.length > 0) {
    const result = {
      candles,
      lastDate: moment(candles[candles.length - 1][0])
        .utc()
        .format()
    };
    // context.log(result);
    return result;
  }
  throw new Error("Error loading OHLC");
}

module.exports = LoadOHLC;

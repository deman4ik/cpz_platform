const ccxtpro = require("ccxt.pro");
const exchange = new ccxtpro.binance({
  enableRateLimit: true,
  options: { defaultType: "future" }
});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function run(ver) {
  try {
    //await exchange.watchTrades("BTC/USDT");

    while (true) {
      try {
        /* const trades = exchange.trades["BTC/USDT"];
        console.log(new Date(), trades);*/

        const candles = await exchange.watchOHLCV("BTC/USDT", "1m");
        console.log(
          ver,
          new Date(),
          candles.map(candle => ({
            time: +candle[0],
            timestamp: new Date(+candle[0]).toISOString(),
            open: +candle[1],
            high: +candle[2],
            low: +candle[3],
            close: +candle[4],
            volume: +candle[5] || 0
          }))
        );

        //  await exchange.watchOHLCV("BTC/USDT", "5m", 1584961200000, 1);
      } catch (e) {
        console.log(e);
        // stop the loop on exception or leave it commented to retry
        // throw e
      }
    }
  } catch (e) {
    console.error(e);
  }
}

run(1);
run(2);

const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");
const dayjs = require("dayjs");

const run = async () => {
  try {
    const date = "2018-03-01T00:00:00.000Z";
    const valueOf = dayjs(date).valueOf();
    console.log(valueOf);
    const exchangeName = "coinbasepro";
    const agent = new HttpsProxyAgent("");
    const exchange = new ccxt[exchangeName]({ agent });
    // console.log(exchange.markets());
    const result = await exchange.fetchOHLCV("BTC/USD", "1m", valueOf, 300);
    console.log("result: ", result.length);
    const data = result.map(item => ({
      time: item[0],
      timestamp: dayjs(item[0]).toISOString(),
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5]
    }));
    console.log("data:", data.length);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();

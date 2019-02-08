const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");
const dayjs = require("dayjs");

async function run() {
  const dateToLoad = "2019-01-16T10:00:00.000Z";
  const seconds = dayjs(dateToLoad).valueOf();
  console.log(seconds);
  console.log(dayjs(seconds).toISOString());
  const exchange = new ccxt.kraken({
    agent: new HttpsProxyAgent(
      "http://lum-customer-hl_f5308f09-zone-zone1-country-us:9oyerxm7acgh@zproxy.lum-superproxy.io:22225"
    )
  });
  console.log(exchange.has.fetchOHLCV);
  const response = await exchange.fetchOHLCV("BTC/USD", "1m", seconds);
  console.log("length", response.length);
  console.log("first", dayjs(response[0][0]).toISOString());
  console.log("last", dayjs(response[response.length - 1][0]).toISOString());
}

run();

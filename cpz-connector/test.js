const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");

async function run() {
  const exchange = new ccxt.bitfinex({
    agent: new HttpsProxyAgent(
      "http://lum-customer-hl_f5308f09-zone-zone1-country-us:9oyerxm7acgh@zproxy.lum-superproxy.io:22225"
    )
  });
  await exchange.load_markets();
  console.log(exchange.markets["BTC/USD"]);
}

run();

const dayjs = require("dayjs");
const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");
// const d = dayjs("2018-09-17T14:20:10.150Z").valueOf();

async function run() {
  try {
    const agent = new HttpsProxyAgent(
      "http://lum-customer-hl_f5308f09-zone-zone1-country-br:vgvxoz8j2qmt@zproxy.lum-superproxy.io:22225"
    );
    const exchange = new ccxt.bitfinex2({
      agent
    });

    const response = await exchange.fetchOHLCV(
      "BTC/USDT",
      "1m",
      dayjs()
        .add(-2, "minute")
        .valueOf(),
      10
    );
    const data = [];
    response.forEach(lastCandle => {
      data.push({
        time: dayjs(lastCandle[0]).toJSON(),
        open: lastCandle[1],
        high: lastCandle[2],
        low: lastCandle[3],
        close: lastCandle[4],
        volume: lastCandle[5]
      });
    });
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

run();

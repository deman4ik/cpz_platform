const ccxt = require("ccxt");
const HttpsProxyAgent = require("https-proxy-agent");
const cloudscraper = require("cloudscraper");

const scrapeCloudflareHttpHeaderCookie = url =>
  new Promise((resolve, reject) =>
    cloudscraper.get(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(response.request.headers);
      }
    })
  );

const input = {
  exchange: "",
  proxy: "http://localhost:8118/"
};

const loadMarkets = async prms => {
  try {
    const agent = new HttpsProxyAgent(prms.proxy);
    const exchange = new ccxt[prms.exchange]({
      //  verbose: true,
      // enableRateLimit: true,
      // proxy: "https://crossorigin.me/",
      agent
    });
    exchange.headers = await scrapeCloudflareHttpHeaderCookie(
      exchange.urls.www
    );
    const result = await exchange.loadMarkets();
    // console.log(result);
    return result;
  } catch (err) {
    // console.log(err);
    throw err;
  }
};

test("bitfinex", async () => {
  // VG
  jest.setTimeout(12000);
  input.exchange = "bitfinex2";
  const result = await loadMarkets(input);
  expect(result).toBeDefined();
});

test("bitmex", async () => {
  // SC
  jest.setTimeout(12000);
  input.exchange = "bitmex";
  const result = await loadMarkets(input);
  expect(result).toBeDefined();
});

test("binance", async () => {
  // JP
  jest.setTimeout(12000);
  input.exchange = "binance";
  const result = await loadMarkets(input);
  expect(result).toBeDefined();
});

test("gdax", async () => {
  // US
  jest.setTimeout(12000);
  input.exchange = "gdax";
  const result = await loadMarkets(input);
  expect(result).toBeDefined();
});

test("kraken", async () => {
  // US
  jest.setTimeout(12000);
  input.exchange = "kraken";
  const result = await loadMarkets(input);
  expect(result).toBeDefined();
});

test("poloniex", async () => {
  // US
  jest.setTimeout(12000);
  input.exchange = "poloniex";
  const result = await loadMarkets(input);
  expect(result).toBeDefined();
});

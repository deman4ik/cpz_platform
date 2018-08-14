const ccxt = require("ccxt");
const asTable = require("as-table");
const log = require("ololog").configure({ locate: false });
const HttpsProxyAgent = require("https-proxy-agent");
const cloudscraper = require("cloudscraper");

require("ansicolor").nice;

const scrapeCloudflareHttpHeaderCookie = url => {
  if (!url) return;
  console.log(url);
  const parsed = new URL(url);
  if (parsed.href !== undefined)
    return new Promise((resolve, reject) =>
      cloudscraper.get(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.request.headers);
        }
      })
    );
};
//-----------------------------------------------------------------------------

process.on("uncaughtException", e => {
  log.bright.red.error(e);
  process.exit(1);
});
process.on("unhandledRejection", e => {
  log.bright.red.error(e);
  process.exit(1);
});

//-----------------------------------------------------------------------------

const test = async function(exchange) {
  try {
    await exchange.loadMarkets();
    log(
      exchange.id.green,
      "loaded",
      exchange.symbols.length.toString().bright.green,
      "symbols"
    );
  } catch (e) {
    if (e instanceof ccxt.DDoSProtection) {
      log.bright.yellow(exchange.id, `[DDoS Protection] ${e.message}`);
    } else if (e instanceof ccxt.RequestTimeout) {
      log.bright.yellow(exchange.id, `[Request Timeout] ${e.message}`);
    } else if (e instanceof ccxt.AuthenticationError) {
      log.bright.yellow(exchange.id, `[Authentication Error] ${e.message}`);
    } else if (e instanceof ccxt.ExchangeNotAvailable) {
      log.bright.yellow(exchange.id, `[Exchange Not Available] ${e.message}`);
    } else if (e instanceof ccxt.ExchangeError) {
      log.bright.yellow(exchange.id, `[Exchange Error] ${e.message}`);
    } else if (e instanceof ccxt.NetworkError) {
      log.bright.yellow(exchange.id, `[Network Error] ${e.message}`);
    } else {
      throw e;
    }
  }
};

//-----------------------------------------------------------------------------

const exchanges = [];

async function main() {
  // instantiate all exchanges
  await Promise.all(
    ccxt.exchanges.map(async id => {
      const exchange = new ccxt[id]({
        agent: new HttpsProxyAgent(
          "http://lum-customer-hl_f5308f09-zone-zone1:vgvxoz8j2qmt@zproxy.lum-superproxy.io:22225"
        )
      });

      exchanges.push(exchange);
      await test(exchange);
    })
  );

  const succeeded = exchanges
    .filter(exchange => !!exchange.markets)
    .length.toString().bright.green;
  const failed = exchanges.filter(exchange => !exchange.markets).length;
  const total = ccxt.exchanges.length.toString().bright.white;
  let numSymbols = 0;
  exchanges.map(exchange => {
    numSymbols += exchange.symbols ? exchange.symbols.length : 0;
  });
  log(
    numSymbols,
    "symbols from",
    succeeded,
    "of",
    total,
    "exchanges loaded",
    `(${failed} errors)`.red
  );
}

main();

const baseUrl = "https://min-api.cryptocompare.com/data/";

function coinList() {
  return `${baseUrl}all/coinlist`;
}

function exchangeList() {
  return `${baseUrl}all/exchanges`;
}

function price(options) {
  let url = `${baseUrl}price?fsym=${options.fsym}&tsyms=${options.tsyms}`;
  if (options.exchanges) url += `&e=${options.exchanges}`;
  if (options.tryConversion === false) url += "&tryConversion=false";
  return url;
}

function priceMulti(options) {
  let url = `${baseUrl}pricemulti?fsyms=${options.fsyms}&tsyms=${
    options.tsyms
  }`;
  if (options.exchanges) url += `&e=${options.exchanges}`;
  if (options.tryConversion === false) url += "&tryConversion=false";
  return url;
}

function priceFull(options) {
  let url = `${baseUrl}pricemultifull?fsyms=${options.fsyms}&tsyms=${
    options.tsyms
  }`;
  if (options.exchanges) url += `&e=${options.exchanges}`;
  if (options.tryConversion === false) url += "&tryConversion=false";
  return url;
}

function priceHistorical(options) {
  let url = `${baseUrl}pricehistorical?fsym=${options.fsym}&tsyms=${
    options.tsyms
  }&ts=${options.time}`;
  if (options.exchanges) url += `&e=${options.exchanges}`;
  if (options.tryConversion === false) url += "&tryConversion=false";
  return url;
}

function generateAvg(options) {
  let url = `${baseUrl}generateAvg?fsym=${options.fsym}&tsym=${
    options.tsym
  }&e=${options.e}`;
  if (options.tryConversion === false) url += "&tryConversion=false";
  return url;
}

function topPairs(options) {
  let url = `${baseUrl}top/pairs?fsym=${options.fsym}`;
  if (options.limit) url += `&limit=${options.limit}`;
  return url;
}

function topExchanges(options) {
  let url = `${baseUrl}top/exchanges?fsym=${options.fsym}&tsym=${options.tsym}`;
  if (options.limit) url += `&limit=${options.limit}`;
  return url;
}

function topExchangesFull(options) {
  let url = `${baseUrl}top/exchanges/full?fsym=${options.fsym}&tsym=${
    options.tsym
  }`;
  if (options.limit) url += `&limit=${options.limit}`;
  return url;
}

function histoDay(options) {
  let url = `${baseUrl}histoday?fsym=${options.fsym}&tsym=${options.tsym}`;
  if (options.exchange) url += `&e=${options.exchange}`;
  if (options.limit === "none") url += "&allData=true";
  else if (options.limit) url += `&limit=${options.limit}`;
  if (options.tryConversion === false) url += "&tryConversion=false";
  if (options.aggregate) url += `&aggregate=${options.aggregate}`;
  if (options.timestamp) url += `&toTs=${options.timestamp}`;
  return url;
}

function histoHour(options) {
  let url = `${baseUrl}histohour?fsym=${options.fsym}&tsym=${options.tsym}`;
  if (options.exchange) url += `&e=${options.exchange}`;
  if (options.limit) url += `&limit=${options.limit}`;
  if (options.tryConversion === false) url += "&tryConversion=false";
  if (options.aggregate) url += `&aggregate=${options.aggregate}`;
  if (options.timestamp) url += `&toTs=${options.timestamp}`;
  return url;
}

function histoMinute(options) {
  let url = `${baseUrl}histominute?fsym=${options.fsym}&tsym=${options.tsym}`;
  if (options.exchange) url += `&e=${options.exchange}`;
  if (options.limit) url += `&limit=${options.limit}`;
  if (options.tryConversion === false) url += "&tryConversion=false";
  if (options.aggregate) url += `&aggregate=${options.aggregate}`;
  if (options.timestamp) url += `&toTs=${options.timestamp}`;
  return url;
}

module.exports = {
  coinList,
  exchangeList,
  price,
  priceMulti,
  priceFull,
  priceHistorical,
  generateAvg,
  topPairs,
  topExchanges,
  topExchangesFull,
  histoDay,
  histoHour,
  histoMinute
};

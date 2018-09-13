/*
 * Сохранение минутной свечи и запрос новых свечей в доступных таймфреймах
 */
const { GraphQLClient } = require("graphql-request");
// const base64 = require("base-64");
// Считывание переменных окружения
const { DB_API_ENDPOINT } = process.env;

// Создание GraphQL клиента
const client = new GraphQLClient(DB_API_ENDPOINT, {
  /*  headers: {
    // Базовая авторизация
    Authorization: `Basic ${base64.encode(`${DB_API_USER}:${DB_API_SECRET}`)}`
  } */
});

async function saveCandle(context, candle) {
  // Запрос
  const query = `mutation pCandlesInsert (
  $start: Int!,
  $open:  BigFloat!,
  $high:  BigFloat!,
  $low:  BigFloat!,
  $close:  BigFloat!
  $volume:  BigFloat!,
  $trades: Int,
  $vwp: BigFloat,
  $currency: String!,
  $asset: String!,
  $exchange: String!
)
{
  pCandlesInsert(input: {nstart: $start, nopen: $open,
  nhigh: $high, nlow: $low, nclose: $close, nvolume: $volume,
  ntrades: $trades, nvwp: $vwp, scurency: $currency, 
  sasset: $asset, sexchange: $exchange}) {
    string
  }
}`;
  try {
    /* const testVars = {
      start: 1530540000,
      open: 6329.5,
      high: 6329.93,
      low: 6329.5,
      close: 6329.93,
      volume: 1.69403961,
      exchange: "gdax",
      currency: "USD",
      asset: "BTC"
    }; */
    const variables = {
      start: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      exchange: candle.exchange,
      currency: candle.currency,
      asset: candle.asset
    };
    const result = await client.request(query, variables);
    /*
    {
  "data": {
    "pCandlesInsert": {
      "string": "{\"timeframe30\":{\"id\":78,\"time_start\":\"2018-07-02T13:31:00\",\"time_end\":\"2018-07-02T14:00:00\",\"start\":1530538260,\"end\":1530540000,\"open\":6603.03,\"high\":6665,\"low\":6540.53,\"close\":6606,\"volume\":1122.33273383,\"trades\":3519,\"vwp\":197843.176536525,\"currency\":\"USD\",\"asset\":\"BTC\",\"exchange\":5,\"gap\":0}, 
      \"timeframe60\":{\"id\":40,\"time_start\":\"2018-07-02T13:01:00\",\"time_end\":\"2018-07-02T14:00:00\",\"start\":1530536460,\"end\":1530540000,\"open\":6333.3,\"high\":6665,\"low\":6333.3,\"close\":6606,\"volume\":2079.8053935,\"trades\":6576,\"vwp\":389400.785831847,\"currency\":\"USD\",\"asset\":\"BTC\",\"exchange\":5,\"gap\":0}}"
    }
  }
} */
    const data = JSON.parse(result.pCandlesInsert.string);
    return data;
  } catch (err) {
    context.log.error(`Can't save candle.\n${err}`);
    throw err;
  }
}

async function saveCandlesArray(context, input) {
  const query = `mutation pCandlesInsertJa(
    $exchange: String!
    $currency: String!
    $asset: String!
    $timeframe: Int!
    $candles: JSON!
  ) {
    pCandlesInsertJa(input: { exchange: $exchange, currency:$currency,
     asset: $asset, timeframe: $timeframe, candles: $candles }) {
      string
    }
  }
  `;
  try {
    const result = await client.request(query, input);
    const data = JSON.parse(result);
    return data;
  } catch (err) {
    context.log.error(`Can't save candles.\n${err}`);
    throw err;
  }
}

module.exports = { saveCandle, saveCandlesArray };

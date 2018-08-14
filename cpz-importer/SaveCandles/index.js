const { GraphQLClient } = require("graphql-request");
const base64 = require("base-64");

// Считывание переменных окружения
const { DB_API_ENDPOINT, DB_API_USER, DB_API_SECRET } = process.env;

// Создание GraphQL клиента
const client = new GraphQLClient(DB_API_ENDPOINT, {
  headers: {
    // Базовая авторизация
    Authorization: `Basic ${base64.encode(`${DB_API_USER}:${DB_API_SECRET}`)}`
  }
});
// Запрос
const query = `mutation SaveCandles(
    $exchange: String!
    $currency: String!
    $asset: String!
    $timeframe: String!
    $candles: JSON!
  ) {
    candlesInsert(input: { exchange: $exchange, currency:$currency,
     asset: $asset, timeframe: $timeframe, candles: $candles }) {
      result
    }
  }`;
// Функция сохранения свечей
async function SaveCandles(context, input) {
  context.log("SaveCandles");
  context.log(input);

  const candles = input.data;
  const variables = {
    exchange: input.input.exchange,
    currency: input.input.quote,
    asset: input.input.baseq,
    timeframe: input.input.timeframe
  };
  while (candles.length) {
    /* лимит в 100 записей */
    const batch = candles.splice(0, 100);
    try {
      // Переменные запроса
      variables.candles = batch;
      // Выполняем запрос
      const result = await client.request(query, variables); //eslint-disable-line
      context.log(result);
    } catch (err) {
      context.log(err); // GraphQL response errors
      throw err;
    }
  }
}

module.exports = SaveCandles;

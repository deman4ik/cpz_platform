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
    $candles: JSON!
  ) {
    pCandlesInsertJa(input: { exchange: $exchange, currency:$currency,
     asset: $asset, candles: $candles }) {
      integer
    }
  }`;
// Функция сохранения свечей
async function SaveOHLC(context, input) {
  context.log("SaveOHLC");
  context.log(input);
  try {
    // Переменные запроса
    const variables = {
      exchange: input.input.exchange,
      currency: input.input.quote,
      asset: input.input.baseq,
      candles: JSON.stringify(input.data)
    };
    // Выполняем запрос
    const result = await client.request(query, variables);
    context.log(result);
  } catch (err) {
    context.log(err); // GraphQL response errors
    throw err;
  }
}

module.exports = SaveOHLC;

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
const query = `query RobotsList {
    allRobots(orderBy: CODE_ASC) {
      nodes {
        id
        code
        name
        descr
      }
    }
  }`;
async function CandleSave(context) {
  try {
    const result = await client.request(query);
    context.res = { body: result.allRobots.nodes };
  } catch (err) {
    context.res = { status: 500, body: err };
  }
}

module.exports = CandleSave;

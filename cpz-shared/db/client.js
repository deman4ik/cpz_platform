import { GraphQLClient } from "graphql-request";
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

export default client;

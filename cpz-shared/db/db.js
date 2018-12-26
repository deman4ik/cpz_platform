import { GraphQLClient } from "graphql-request";

const { DB_API_ENDPOINT, DB_API_ACCESS_KEY } = process.env;
const client = new GraphQLClient(DB_API_ENDPOINT, {
  headers: {
    "X-Hasura-Access-Key": `${DB_API_ACCESS_KEY}`
    // TODO: Authorization
  }
});

export default client;

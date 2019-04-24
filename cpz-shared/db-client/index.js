import { GraphQLClient } from "graphql-request";

class DB {
  constructor() {
    this._client = null;
  }

  init(endpoint, key) {
    if (!endpoint || !key) throw new Error("Invalid db client credentials");
    this._client = new GraphQLClient(endpoint, {
      headers: {
        "X-Hasura-Admin-Secret": key
      }
    });
  }

  get client() {
    return this._client;
  }
}

const db = new DB();

export default db;

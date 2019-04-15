import { GraphQLClient } from "graphql-request";

class DB {
  constructor() {
    this.client = null;
  }

  init({ endpoint, key }) {
    if (!endpoint || !key) throw new Error("Invalid db client credentials");
    this.client = new GraphQLClient(endpoint, {
      headers: {
        "X-Hasura-Admin-Secret": key
      }
    });
  }
}

const db = new DB();

export default db;

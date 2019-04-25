import { GraphQLClient } from "graphql-request";

class ConnectorClient {
  constructor() {
    this._client = null;
  }

  init(endpoint, key) {
    if (!endpoint || !key)
      throw new Error("Invalid connector client credentials");
    this._client = new GraphQLClient(endpoint, {
      headers: {
        "api-key": key
        // TODO: Authorization
      }
    });
  }

  get client() {
    return this._client;
  }
}
const client = new ConnectorClient();
export default client;

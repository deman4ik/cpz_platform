import { GraphQLClient } from "graphql-request";

class ConnectorClient {
  constructor() {
    this.client = null;
  }

  init({ endpoint, key }) {
    if (!endpoint || !key)
      throw new Error("Invalid connector client credentials");
    this.client = new GraphQLClient(endpoint, {
      headers: {
        "api-key": key
        // TODO: Authorization
      }
    });
  }
}
const client = new ConnectorClient();
export default client;

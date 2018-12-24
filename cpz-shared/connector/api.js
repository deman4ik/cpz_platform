import { GraphQLClient } from "graphql-request";

class BaseConnectorAPI {
  constructor() {
    const { CONNECTOR_API_ENDPOINT, CONNECTOR_API_KEY } = process.env;
    this.client = new GraphQLClient(CONNECTOR_API_ENDPOINT, {
      headers: {
        "API-Key": `${CONNECTOR_API_KEY}`
        // TODO: Authorization
      }
    });
  }
}

export default BaseConnectorAPI;

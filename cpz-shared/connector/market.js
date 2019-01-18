import VError from "verror";
import client from "./connector";

async function marketEx({ exchange, proxy, asset, currency }) {
  try {
    const query = `query market(
        $connectorInput: PublicConnectorInput!
        $asset: String!
        $currency: String!
      ) {
        market(connectorInput: $connectorInput, asset: $asset, currency: $currency) {
          success
          error {
            name
            message
            info
          }
          market
        }
      }`;
    const variables = {
      connectorInput: {
        exchange,
        proxy
      },
      asset,
      currency
    };

    const { market } = await client.request(query, variables);
    if (!market.success) {
      const { name, info, message } = market.error;
      throw new VError({ name, info }, message);
    }
    return market.market;
  } catch (error) {
    throw new VError(
      {
        name: "ConnectorAPIError",
        cause: error
      },
      "Failed to load market info."
    );
  }
}

export { marketEx };

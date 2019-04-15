import ServiceError from "../error";
import Connector from "./index";

async function marketEX({ exchange, proxy, asset, currency }) {
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

    const { market } = await Connector.request(query, variables);
    if (!market.success) {
      const { name, info, message } = market.error;
      throw new ServiceError({ name, info }, message);
    }
    return market.market;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_CLIENT_ERROR,
        cause: error
      },
      "Failed to load market info."
    );
  }
}

export { marketEX };

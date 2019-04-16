import ServiceError from "../error";
import Connector from "./index";

async function tradesEX({ exchange, proxy, asset, currency, date, limit }) {
  try {
    const query = `query trades(
        $connectorInput: PublicConnectorInput!
        $date: DateTime
        $limit: Int
        $asset: String!
        $currency: String!
      ) {
        trades(
          connectorInput: $connectorInput
          date: $date
          limit: $limit
          asset: $asset
          currency: $currency
        ) {
          success
          error {
            name
            message
            info
          }
          trades
        }
      }
      
      `;
    const variables = {
      connectorInput: {
        exchange,
        proxy
      },
      date,
      limit,
      asset,
      currency
    };

    const { trades } = await Connector.client.request(query, variables);
    if (!trades.success) {
      const { name, info, message } = trades.error;
      throw new ServiceError({ name, info }, message);
    }
    return trades.trades;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_CLIENT_ERROR,
        cause: error
      },
      "Failed to load trades."
    );
  }
}

export { tradesEX };

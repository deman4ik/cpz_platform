import VError from "verror";
import client from "./connector";

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

    const { trades } = await client.request(query, variables);
    if (!trades.success) {
      const { name, info, message } = trades.error;
      throw new VError({ name, info }, message);
    }
    return trades.trades;
  } catch (error) {
    throw new VError(
      {
        name: "ConnectorAPIError",
        cause: error
      },
      "Failed to load trades."
    );
  }
}

export { tradesEX };

import VError from "verror";
import client from "./connector";

async function lastMinuteCandleEX({ exchange, proxy, asset, currency, date }) {
  try {
    const query = `query lastMinuteCandle(
        $connectorInput: PublicConnectorInput!
        $date: DateTime
        $asset: String!
        $currency: String!
      ) {
        lastMinuteCandle(
          connectorInput: $connectorInput
          date: $date
          asset: $asset
          currency: $currency
        ) {
          success
          error {
            code
            message
            info
          }
          candle
        }
      }`;
    const variables = {
      connectorInput: {
        exchange,
        proxy
      },
      order: {
        date,
        asset,
        currency
      }
    };

    return await client.request(query, variables);
  } catch (error) {
    throw new VError(
      {
        name: "ConnectorAPIError",
        cause: error
      },
      "Failed to load last minute candle."
    );
  }
}

async function minuteCandlesEX({
  exchange,
  proxy,
  asset,
  currency,
  date,
  limit
}) {
  try {
    const query = `query minuteCandles(
        $connectorInput: PublicConnectorInput!
        $date: DateTime
        $limit: Int
        $asset: String!
        $currency: String!
      ) {
        minuteCandles(
          connectorInput: $connectorInput
          date: $date
          limit: $limit
          asset: $asset
          currency: $currency
        ) {
          success
          error {
            code
            message
            info
          }
          candles
        }
      }
      `;
    const variables = {
      connectorInput: {
        exchange,
        proxy
      },
      order: {
        date,
        limit,
        asset,
        currency
      }
    };

    return await client.request(query, variables);
  } catch (error) {
    throw new VError(
      {
        name: "ConnectorAPIError",
        cause: error
      },
      "Failed to load minute candles."
    );
  }
}

export { lastMinuteCandleEX, minuteCandlesEX };

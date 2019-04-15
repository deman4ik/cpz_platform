import ServiceError from "../error";
import Connector from "./index";

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
            name
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
      date,
      asset,
      currency
    };

    const { lastMinuteCandle } = await Connector.request(query, variables);
    if (!lastMinuteCandle.success) {
      const { name, info, message } = lastMinuteCandle.error;
      throw new ServiceError({ name, info }, message);
    }
    return lastMinuteCandle.candle;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_CLIENT_ERROR,
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
            name
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
      date,
      limit,
      asset,
      currency
    };

    const { minuteCandles } = await Connector.request(query, variables);
    if (!minuteCandles.success) {
      const { name, info, message } = minuteCandles.error;
      throw new ServiceError({ name, info }, message);
    }
    return minuteCandles.candles;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_CLIENT_ERROR,
        cause: error
      },
      "Failed to load minute candles."
    );
  }
}

export { lastMinuteCandleEX, minuteCandlesEX };

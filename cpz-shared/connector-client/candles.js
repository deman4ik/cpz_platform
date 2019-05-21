import ServiceError from "../error";
import Connector from "./index";

async function currentCandleEX({
  exchange,
  proxy,
  asset,
  currency,
  timeframe
}) {
  try {
    const query = `query currentCandle(
      $connectorInput: PublicConnectorInput!
      $asset: String!
      $currency: String!
      $timeframe: Int!
    ) {
      currentCandle(
        connectorInput: $connectorInput
        asset: $asset
        currency: $currency
        timeframe: $timeframe
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
      asset,
      currency,
      timeframe
    };

    const { currentCandle } = await Connector.client.request(query, variables);
    if (!currentCandle.success) {
      const { name, info, message } = currentCandle.error;
      throw new ServiceError({ name, info }, message);
    }
    return currentCandle.candle;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_CLIENT_ERROR,
        info: { exchange, asset, currency, timeframe },
        cause: error
      },
      "Failed to load current candle."
    );
  }
}

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

    const { lastMinuteCandle } = await Connector.client.request(
      query,
      variables
    );
    if (!lastMinuteCandle.success) {
      const { name, info, message } = lastMinuteCandle.error;
      throw new ServiceError({ name, info }, message);
    }
    return lastMinuteCandle.candle;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_CLIENT_ERROR,
        info: { exchange, asset, currency, date },
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

    const { minuteCandles } = await Connector.client.request(query, variables);
    if (!minuteCandles.success) {
      const { name, info, message } = minuteCandles.error;
      throw new ServiceError({ name, info }, message);
    }
    return minuteCandles.candles;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_CLIENT_ERROR,
        info: { exchange, asset, currency, date, limit },
        cause: error
      },
      "Failed to load minute candles."
    );
  }
}

export { currentCandleEX, lastMinuteCandleEX, minuteCandlesEX };

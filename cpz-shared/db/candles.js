import VError from "verror";
import { chunkArray } from "../utils/helpers";

async function saveCandles({ timeframe, candles }) {
  try {
    const query = `mutation insert_candles${timeframe}($objects: [cpz_candles${timeframe}_insert_input!]!) {
        insert_cpz_candles${timeframe}(
          objects: $objects
          on_conflict: { constraint: c_candles${timeframe}_uk }
        ) {
          affected_rows
        }
      }
      `;
    if (candles && candles.length > 0) {
      const chunks = chunkArray(candles, 100);

      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const chunk of chunks) {
        if (chunk.length > 0) {
          try {
            const variables = {
              objects: chunk.map(candle => ({
                id: candle.id,
                exchange: candle.exchange,
                asset: candle.asset,
                currency: candle.currency,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume,
                time: candle.time,
                timestamp: candle.timestamp,
                type: candle.type
              }))
            };

            await this.client.request(query, variables);
          } catch (error) {
            throw error;
          }
        }
      }
      /* no-restricted-syntax, no-await-in-loop */
    }
  } catch (error) {
    throw new VError(
      {
        name: "DBError",
        cause: error
      },
      "Failed to save candles to DB;"
    );
  }
}

async function getCandles({
  exchange,
  asset,
  currency,
  timeframe,
  dateFrom,
  dateTo,
  orderBy = "{ timestamp: asc }",
  offset = 0,
  limit
}) {
  try {
    const table = `cpz_candles${timeframe}`;
    const query = `query ${table}(
        $exchange: String!
        $asset: String!
        $currency: String!
        $dateFrom: timestamp
        $dateTo: timestamp
        $limit: Int
        $offset: Int
      ) {
        ${table}(
          order_by: ${orderBy}
          offset: $offset
          limit: $limit
          where: {
            exchange: { _eq: $exchange }
            asset: { _eq: $asset }
            currency: { _eq: $currency }
            timestamp: { _gte: $dateFrom, _lte: $dateTo }
          }
        ) {
          id
          exchange
          asset
          currency
          open
          high
          low
          close
          volume
          time
          timestamp
          type
        }
      }`;
    const variables = {
      exchange,
      asset,
      currency,
      dateFrom,
      dateTo,
      offset,
      limit
    };
    const response = await this.client.request(query, variables);
    return response[table];
  } catch (error) {
    throw new VError(
      {
        name: "DBError",
        cause: error
      },
      "Failed to query candles from DB;"
    );
  }
}

async function countCandles({
  exchange,
  asset,
  currency,
  timeframe,
  dateFrom,
  dateTo
}) {
  try {
    const table = `cpz_candles${timeframe}`;
    const query = `query ${table}(
        $exchange: String!
        $asset: String!
        $currency: String!
        $dateFrom: timestamp
        $dateTo: timestamp
      ) {
       ${table}_aggregate(
          where: {
            exchange: { _eq: $exchange }
            asset: { _eq: $asset }
            currency: { _eq: $currency }
            timestamp: { _gte: $dateFrom, _lte: $dateTo }
          }
        ) {
          aggregate {
            count
          }
        }
       }`;
    const variables = {
      exchange,
      asset,
      currency,
      dateFrom,
      dateTo
    };
    const response = await this.client.request(query, variables);
    return response[`${table}_aggregate`].aggregate.count;
  } catch (error) {
    throw new VError(
      {
        name: "DBError",
        cause: error
      },
      "Failed to count candles in DB;"
    );
  }
}

export { saveCandles, getCandles, countCandles };

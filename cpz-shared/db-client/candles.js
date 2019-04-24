import ServiceError from "../error";
import DB from "./index";
import { CANDLE_PREVIOUS } from "../config/state";
import { chunkArray } from "../utils/helpers";

async function saveCandlesDB({ timeframe, candles }) {
  try {
    const query = `mutation insert_candles${timeframe}($objects: [cpz_candles${timeframe}_insert_input!]!) {
        insert_cpz_candles${timeframe}(
          objects: $objects
          on_conflict: { 
            constraint: c_candles${timeframe}_uk
            update_columns: [open, high, low, close, volume, type] 
        }) {
          affected_rows
        }
      }
      `;
    const errors = [];
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

            await DB.client.request(query, variables);
          } catch (error) {
            errors.push(error);
          }
        }
      }
      /* no-restricted-syntax, no-await-in-loop */
    }
    if (errors.length > 0)
      throw new ServiceError(
        {
          name: ServiceError.types.DB_ERROR,
          cause: errors[0],
          info: {
            errors
          }
        },
        "Failed to save candles to DB"
      );
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to save candles to DB"
    );
  }
}

async function getCandlesDB({
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
        $excludeCandleType: String
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
            type: { _neq: $excludeCandleType}
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
      limit,
      excludeCandleType: CANDLE_PREVIOUS
    };
    const response = await DB.client.request(query, variables);
    const candles = response[table];
    return candles.map(candle => ({
      ...candle,
      timeframe,
      time: parseInt(candle.time, 10)
    }));
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to query candles from DB"
    );
  }
}

async function countCandlesDB({
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
    const response = await DB.client.request(query, variables);
    return response[`${table}_aggregate`].aggregate.count;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.DB_ERROR,
        cause: error
      },
      "Failed to count candles in DB"
    );
  }
}

export { saveCandlesDB, getCandlesDB, countCandlesDB };

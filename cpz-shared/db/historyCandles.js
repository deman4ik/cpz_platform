import VError from "verror";
import client from "./client";
import { tryParseJSON } from "../utils/helpers";

async function getHistoryCandles(input) {
  let tablename;
  if (input.timeframe === 1) {
    tablename = "allCandles";
  } else {
    tablename = `allCandles${input.timeframe}S`;
  }
  const query = `query backtest${tablename}(
    $exchange: Int!
    $asset: String!
    $currency: String!
    $dateFrom: Datetime
    $dateTo: Datetime
    $first: Int
    $before: Cursor
    $after: Cursor
  ) {
    ${tablename}(
      first: $first
      before: $before
      after: $after
      ${input.orderByTimestampDesc ? "orderBy: TIMESTAMP_DESC" : ""}
      condition: { exchange: $exchange, asset: $asset, currency: $currency }
      filter: {
        timestamp: { greaterThanOrEqualTo: $dateFrom, lessThanOrEqualTo: $dateTo }
      }
    ) {
      nodes {
        id
        timestamp
        open
        high
        low
        close
        volume
        trades
        vwp
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
  
  `;
  try {
    const variables = {
      exchange: input.exchange,
      asset: input.asset,
      currency: input.currency,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      first: input.first,
      before: input.before,
      after: input.after
    };
    const response = await client.request(query, variables);
    return response[tablename];
  } catch (error) {
    throw new VError(
      {
        name: "GraphQLQueryError",
        cause: error,
        info: {
          input
        }
      },
      'Failed to execute GraphQL query "%s";',
      `backtest${tablename}`
    );
  }
}

export default getHistoryCandles;

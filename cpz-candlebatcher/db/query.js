const client = require("./client");
const { tryParseJSON } = require("../tableStorage/utils");

async function getFirstGap(context, input) {
  const query = `query candles_diff(
    $exchange: String
    $asset: String
    $currency: String
    $timestampFrom: Datetime
  ) {
    allVCandlesDiffs(
      orderBy:TIMESTAMP_ASC
      first: 1,
      condition: { exchange: $exchange, asset: $asset, currency: $currency }
      filter: { timestamp: { greaterThanOrEqualTo: $timestampFrom } }
    ) {
      nodes {
        time
      }
    }
  }
  `;
  try {
    const variables = {
      exchange: input.exchange,
      asset: input.asset,
      currency: input.currency,
      timestampFrom: input.dateFrom
    };
    const result = await client.request(query, variables);
    const data = tryParseJSON(result.allVCandlesDiffs.nodes[0].time);
    if (data) return { isSuccess: true, data };
    throw result;
  } catch (error) {
    this.context.log.error(error);
    throw error;
  }
}

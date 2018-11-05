import VError from "verror";
import client from "./client";
import { tryParseJSON } from "../utils/helpers";
/**
 * Сохранение минутной свечи и запрос новых свечей в доступных таймфреймах
 *
 * @param {*} context
 * @param {*} candle
 * @returns
 */
async function saveCandle(candle) {
  // Запрос
  const query = `mutation pCandlesInsert (
  $time: Int!,
  $open:  BigFloat!,
  $high:  BigFloat!,
  $low:  BigFloat!,
  $close:  BigFloat!
  $volume:  BigFloat!,
  $trades: Int,
  $vwp: BigFloat,
  $currency: String!,
  $asset: String!,
  $exchange: String!
)
{
  pCandlesInsert(input: {ntime: $time, nopen: $open,
  nhigh: $high, nlow: $low, nclose: $close, nvolume: $volume,
  ntrades: $trades, nvwp: $vwp, scurency: $currency, 
  sasset: $asset, sexchange: $exchange}) {
    string
  }
}`;
  try {
    const variables = {
      time:
        candle.time.toString().length > 10 ? candle.time / 1000 : candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      exchange: candle.exchange,
      currency: candle.currency,
      asset: candle.asset
    };
    const result = await client.request(query, variables);
    /*
    {
  "data": {
    "pCandlesInsert": {
      "string": "{\"timeframe30\":{\"id\":78,\"time_start\":\"2018-07-02T13:31:00\",\"time_end\":\"2018-07-02T14:00:00\",\"start\":1530538260,\"end\":1530540000,\"open\":6603.03,\"high\":6665,\"low\":6540.53,\"close\":6606,\"volume\":1122.33273383,\"trades\":3519,\"vwp\":197843.176536525,\"currency\":\"USD\",\"asset\":\"BTC\",\"exchange\":5,\"gap\":0}, 
      \"timeframe60\":{\"id\":40,\"time_start\":\"2018-07-02T13:01:00\",\"time_end\":\"2018-07-02T14:00:00\",\"start\":1530536460,\"end\":1530540000,\"open\":6333.3,\"high\":6665,\"low\":6333.3,\"close\":6606,\"volume\":2079.8053935,\"trades\":6576,\"vwp\":389400.785831847,\"currency\":\"USD\",\"asset\":\"BTC\",\"exchange\":5,\"gap\":0}}"
    }
  }
} */
    const data = tryParseJSON(result.pCandlesInsert.string);
    if (data) return { isSuccess: true, data };
    throw result;
  } catch (error) {
    throw new VError(
      {
        name: "GraphQLMutationError",
        cause: error,
        info: {
          candle
        }
      },
      'Failed to execute GraphQL mutation "pCandlesInsert";'
    );
  }
}

async function saveCandlesArray(input) {
  const query = `mutation pCandlesInsertJa(
    $exchange: String!
    $currency: String!
    $asset: String!
    $timeframe: Int!
    $candles: JSON!
  ) {
    pCandlesInsertJa(input: { exchange: $exchange, currency:$currency,
     asset: $asset, timeframe: $timeframe, candles: $candles }) {
      string
    }
  }
  `;
  try {
    const mutationInput = input;
    mutationInput.candles = input.candles.map(item => [
      item.time * 1000,
      item.open,
      item.high,
      item.low,
      item.close,
      item.volumefrom
    ]);
    await client.request(query, mutationInput);
  } catch (error) {
    throw new VError(
      {
        name: "GraphQLMutationError",
        cause: error,
        info: {
          input
        }
      },
      'Failed to execute GraphQL mutation "pCandlesInsertJa";'
    );
  }
}

export { saveCandle, saveCandlesArray };

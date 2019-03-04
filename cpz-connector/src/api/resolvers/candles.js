import { getPublicConnector } from "../../global";

async function loadLastMinuteCandle(
  _,
  { connectorInput, date, asset, currency },
  { context }
) {
  const connector = await getPublicConnector(connectorInput);
  const result = await connector.loadLastMinuteCandle(context, {
    date,
    asset,
    currency
  });
  return result;
}

async function loadMinuteCandles(
  _,
  { connectorInput, date, limit, asset, currency },
  { context }
) {
  const connector = await getPublicConnector(connectorInput);
  const result = await connector.loadMinuteCandles(context, {
    date,
    limit,
    asset,
    currency
  });
  return result;
}

export { loadLastMinuteCandle, loadMinuteCandles };

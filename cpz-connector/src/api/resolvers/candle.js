import { getPublicConnector } from "../../global";

async function loadLastMinuteCandle(
  _,
  { connectorInput, date, asset, currency }
) {
  const connector = await getPublicConnector(connectorInput);
  const result = await connector.loadLastMinuteCandle({
    date,
    asset,
    currency
  });
  return result;
}

async function loadMinuteCandles(
  _,
  { connectorInput, date, limit, asset, currency }
) {
  const connector = await getPublicConnector(connectorInput);
  const result = await connector.loadMinuteCandles({
    date,
    limit,
    asset,
    currency
  });
  return result;
}

export { loadLastMinuteCandle, loadMinuteCandles };

import { getPublicConnector } from "../../global";

async function loadTrades(
  _,
  { connectorInput, date, limit, asset, currency },
  { context }
) {
  const connector = await getPublicConnector(connectorInput);
  const result = await connector.loadTrades(context, {
    date,
    limit,
    asset,
    currency
  });
  return result;
}

export { loadTrades };

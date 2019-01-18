import { getPublicConnector } from "../../global";

async function getMarket(_, { connectorInput, asset, currency }, { context }) {
  const connector = await getPublicConnector(connectorInput);
  const result = await connector.getMarket(context, {
    asset,
    currency
  });
  return result;
}

export { getMarket };

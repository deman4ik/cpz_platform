import { getPrivateConnector } from "../../global";

async function getBalance(_, { connectorInput }, { context }) {
  const connector = await getPrivateConnector(connectorInput);
  const result = await connector.getBalance(context);
  return result;
}

export { getBalance };

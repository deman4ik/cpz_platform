import { getPrivateConnector } from "../../global";

async function getBalance(_, { connectorInput }) {
  const connector = await getPrivateConnector(connectorInput);
  const result = await connector.getBalance();
  return result;
}

export { getBalance };

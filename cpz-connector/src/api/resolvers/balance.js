import { getConnector } from "../../global";

async function getBalance(_, { connectorInput }) {
  const connector = await getConnector(connectorInput);
  const result = await connector.getBalance();
  return result;
}

export { getBalance };

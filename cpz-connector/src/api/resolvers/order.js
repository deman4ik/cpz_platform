import { getConnector } from "../../global";

async function checkOrder(_, { connectorInput, order }) {
  const connector = await getConnector(connectorInput);
  const result = await connector.checkOrder(order);
  return result;
}

async function createOrder(_, { connectorInput, order }) {
  const connector = await getConnector(connectorInput);
  const result = await connector.createOrder(order);
  return result;
}

async function cancelOrder(_, { connectorInput, order }) {
  const connector = await getConnector(connectorInput);
  const result = await connector.cancelOrder(order);
  return result;
}
export { checkOrder, createOrder, cancelOrder };

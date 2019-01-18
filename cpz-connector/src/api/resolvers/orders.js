import { getPrivateConnector } from "../../global";

async function checkOrder(_, { connectorInput, order }, { context }) {
  const connector = await getPrivateConnector(connectorInput);
  const result = await connector.checkOrder(context, order);
  return result;
}

async function createOrder(_, { connectorInput, order }, { context }) {
  const connector = await getPrivateConnector(connectorInput);
  const result = await connector.createOrder(context, order);
  return result;
}

async function cancelOrder(_, { connectorInput, order }, { context }) {
  const connector = await getPrivateConnector(connectorInput);
  const result = await connector.cancelOrder(context, order);
  return result;
}
export { checkOrder, createOrder, cancelOrder };

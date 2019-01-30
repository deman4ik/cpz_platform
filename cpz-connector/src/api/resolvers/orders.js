import { getPrivateConnector } from "../../global";

async function checkOrder(_, { connectorInput, order }, { context }) {
  const connector = await getPrivateConnector(context, connectorInput);
  const result = await connector.checkOrder(
    context,
    connectorInput.keys,
    order
  );
  return result;
}

async function createOrder(_, { connectorInput, order }, { context }) {
  const connector = await getPrivateConnector(context, connectorInput);
  const result = await connector.createOrder(
    context,
    connectorInput.keys,
    order
  );
  return result;
}

async function cancelOrder(_, { connectorInput, order }, { context }) {
  const connector = await getPrivateConnector(context, connectorInput);
  const result = await connector.cancelOrder(
    context,
    connectorInput.keys,
    order
  );
  return result;
}
export { checkOrder, createOrder, cancelOrder };

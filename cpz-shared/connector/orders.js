import VError from "verror";
import client from "./connector";

async function createOrderEX({
  exchange,
  proxy,
  asset,
  currency,
  userId,
  order
}) {
  try {
    const query = `mutation createOrder($connectorInput: PrivateConnectorInput!, $order: OrderInput!){
    createOrder(connectorInput: $connectorInput, order: $order){
      success
      error {
        code
        message
        info
      }
      order
    }
  }`;
    const variables = {
      connectorInput: {
        userId,
        exchange,
        proxy
      },
      order: {
        direction: order.direction,
        volume: order.volume,
        price: order.price,
        asset,
        currency
      }
    };

    const { createOrder } = await client.request(query, variables);
    if (!createOrder.success) {
      const { code, info, message } = createOrder.error;
      throw new VError({ name: code, info }, message);
    }
    return createOrder.order;
  } catch (error) {
    throw new VError(
      {
        name: "ConnectorAPIError",
        cause: error
      },
      "Failed to create order."
    );
  }
}

async function cancelOrderEX({
  exchange,
  proxy,
  asset,
  currency,
  userId,
  exId
}) {
  try {
    const query = `mutation cancelOrder(
        $connectorInput: PrivateConnectorInput!
        $order: OrderFindInput!
      ) {
        cancelOrder(connectorInput: $connectorInput, order: $order) {
          success
          error {
            code
            message
            info
          }
          order
        }
      }
      `;
    const variables = {
      connectorInput: {
        userId,
        exchange,
        proxy
      },
      order: {
        exId,
        asset,
        currency
      }
    };

    const { cancelOrder } = await client.request(query, variables);
    if (!cancelOrder.success) {
      const { code, info, message } = cancelOrder.error;
      throw new VError({ name: code, info }, message);
    }
    return cancelOrder.order;
  } catch (error) {
    throw new VError(
      {
        name: "ConnectorAPIError",
        cause: error
      },
      "Failed to cancel order."
    );
  }
}

async function checkOrderEX({
  exchange,
  proxy,
  asset,
  currency,
  userId,
  exId
}) {
  try {
    const query = `query order($connectorInput: PrivateConnectorInput!, $order: OrderFindInput!) {
        order(connectorInput: $connectorInput, order: $order) {
          success
          error {
            code
            message
            info
          }
          order
        }
      }
      
        `;
    const variables = {
      connectorInput: {
        userId,
        exchange,
        proxy
      },
      order: {
        exId,
        asset,
        currency
      }
    };

    const { order } = await client.request(query, variables);
    if (!order.success) {
      const { code, info, message } = order.error;
      throw new VError({ name: code, info }, message);
    }
    return order.order;
  } catch (error) {
    throw new VError(
      {
        name: "ConnectorAPIError",
        cause: error
      },
      "Failed to check order."
    );
  }
}

export { createOrderEX, cancelOrderEX, checkOrderEX };

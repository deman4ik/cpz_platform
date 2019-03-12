import VError from "verror";

async function createOrderEX({
  exchange,
  proxy,
  asset,
  currency,
  userId,
  keys,
  order
}) {
  try {
    const query = `mutation createOrder($connectorInput: PrivateConnectorInput!, $order: OrderInput!){
    createOrder(connectorInput: $connectorInput, order: $order){
      success
      error {
        name
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
        keys,
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

    const { createOrder } = await this.client.request(query, variables);
    if (!createOrder.success) {
      const { name, info, message } = createOrder.error;
      throw new VError({ name, info }, message);
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
  keys,
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
            name
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
        keys,
        proxy
      },
      order: {
        exId,
        asset,
        currency
      }
    };

    const { cancelOrder } = await this.client.request(query, variables);
    if (!cancelOrder.success) {
      const { name, info, message } = cancelOrder.error;
      throw new VError({ name, info }, message);
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
  keys,
  exId
}) {
  try {
    const query = `query order($connectorInput: PrivateConnectorInput!, $order: OrderFindInput!) {
        order(connectorInput: $connectorInput, order: $order) {
          success
          error {
            name
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
        keys,
        proxy
      },
      order: {
        exId,
        asset,
        currency
      }
    };

    const { order } = await this.client.request(query, variables);
    if (!order.success) {
      const { name, info, message } = order.error;
      throw new VError({ name, info }, message);
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

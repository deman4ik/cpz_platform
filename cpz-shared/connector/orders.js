import VError from "verror";
import client from "./connector";

async function createOrderEX({ exchange, asset, currency, userId, order }) {
  try {
    const query = `mutation createOrder($connectorInput: ConnectorInput!, $order: OrderInput!){
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
        exchange
      },
      order: {
        direction: order.direction,
        volume: order.volume,
        price: order.price,
        asset,
        currency
      }
    };

    return await client.request(query, variables);
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

async function cancelOrderEX({ exchange, asset, currency, userId, exId }) {
  try {
    const query = `mutation cancelOrder(
        $connectorInput: ConnectorInput!
        $order: OrderFindInput!
      ) {
        cancelOrder(connectorInput: $connectorInput, order: $order) {
          success
          error {
            code
            message
            info
          }
        }
      }
      `;
    const variables = {
      connectorInput: {
        userId,
        exchange
      },
      order: {
        exId,
        asset,
        currency
      }
    };

    return await client.request(query, variables);
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

async function checkOrderEX({ exchange, asset, currency, userId, exId }) {
  try {
    const query = `query order($connectorInput: ConnectorInput!, $order: OrderFindInput!) {
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
        exchange
      },
      order: {
        exId,
        asset,
        currency
      }
    };

    return await tclient.request(query, variables);
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

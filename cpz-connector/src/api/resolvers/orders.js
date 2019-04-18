import ServiceError from "cpz/error";
import Log from "cpz/log";
import { getPrivateConnector } from "../../global";

async function checkOrder(_, { connectorInput, order }) {
  try {
    const connector = await getPrivateConnector(connectorInput);
    const result = await connector.checkOrder(connectorInput.keys, order);
    Log.clearContext();
    return result;
  } catch (e) {
    let error;
    if (e instanceof ServiceError) {
      error = e;
    } else {
      error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_API_ERROR,
          cause: e
        },
        "Failed to process request"
      );
    }
    Log.clearContext();
    return {
      success: false,
      error: error.json
    };
  }
}

async function createOrder(_, { connectorInput, order }) {
  try {
    const connector = await getPrivateConnector(connectorInput);
    const result = await connector.createOrder(connectorInput.keys, order);
    Log.clearContext();
    return result;
  } catch (e) {
    let error;
    if (e instanceof ServiceError) {
      error = e;
    } else {
      error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_API_ERROR,
          cause: e
        },
        "Failed to process request"
      );
    }
    Log.clearContext();
    return {
      success: false,
      error: error.json
    };
  }
}

async function cancelOrder(_, { connectorInput, order }) {
  try {
    const connector = await getPrivateConnector(connectorInput);
    const result = await connector.cancelOrder(connectorInput.keys, order);
    Log.clearContext();
    return result;
  } catch (e) {
    let error;
    if (e instanceof ServiceError) {
      error = e;
    } else {
      error = new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_API_ERROR,
          cause: e
        },
        "Failed to process request"
      );
    }
    Log.clearContext();
    return {
      success: false,
      error: error.json
    };
  }
}
export { checkOrder, createOrder, cancelOrder };

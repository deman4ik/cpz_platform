import ServiceError from "../error";
import Connector from "./index";

async function getBalanceEX({ exchange, proxy, userId, keys }) {
  try {
    const query = `query balance($connectorInput: PrivateConnectorInput!){
        balance(connectorInput: $connectorInput){
          success
          error {
            name
            message
            info
          }
          balance
        }
      }`;
    const variables = {
      connectorInput: {
        userId,
        exchange,
        keys,
        proxy
      }
    };

    const { balance } = await Connector.client.request(query, variables);
    if (!balance.success) {
      const { name, info, message } = balance.error;
      throw new ServiceError({ name, info }, message);
    }
    return balance.balance;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_CLIENT_ERROR,
        cause: error
      },
      "Failed to get user balance."
    );
  }
}

async function checkAPIKeysEX({
  exchange,
  proxy,
  userId,
  APIKeyValue,
  APISecretValue
}) {
  try {
    const query = `query balance($checkConnectorInput: CheckConnectorInput!){
        balance(checkConnectorInput: $checkConnectorInput){
          success
          error {
            name
            message
            info
          }
          balance
        }
      }`;
    const variables = {
      checkConnectorInput: {
        userId,
        exchange,
        APIKeyValue,
        APISecretValue,
        proxy
      }
    };

    const { balance } = await Connector.client.request(query, variables);
    if (!balance.success) {
      const { name, info, message } = balance.error;
      if (name === ServiceError.types.CONNECTOR_EXCHANGE_ERROR) return false;
      throw new ServiceError({ name, info }, message);
    }
    return true;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_CLIENT_ERROR,
        cause: error
      },
      "Failed to check API Keys."
    );
  }
}

export { getBalanceEX, checkAPIKeysEX };

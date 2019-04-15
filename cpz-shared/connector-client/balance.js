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

    const { balance } = await Connector.request(query, variables);
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

export { getBalanceEX };

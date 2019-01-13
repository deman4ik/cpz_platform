import VError from "verror";
import client from "./connector";

async function getBalanceEX({ exchange, proxy, userId }) {
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
        proxy
      }
    };

    const { balance } = await client.request(query, variables);
    if (!balance.success) {
      const { name, info, message } = balance.error;
      throw new VError({ name, info }, message);
    }
    return balance.balance;
  } catch (error) {
    throw new VError(
      {
        name: "ConnectorAPIError",
        cause: error
      },
      "Failed to get user balance."
    );
  }
}

export { getBalanceEX };

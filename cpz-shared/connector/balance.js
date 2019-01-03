import VError from "verror";
import client from "./connector";

async function getBalanceEX({ exchange, proxy, userId }) {
  try {
    const query = `query balance($connectorInput: PrivateConnectorInput!){
        balance(connectorInput: $connectorInput){
          success
          error {
            code
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

    const response = await client.request(query, variables);
    return response.balance;
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

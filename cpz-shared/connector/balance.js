import VError from "verror";
import client from "./connector";

async function getBalanceEX({ exchange, userId }) {
  try {
    const query = `query balance($connectorInput: ConnectorInput!){
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
        exchange
      }
    };

    return await client.request(query, variables);
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

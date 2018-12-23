import VError from "verror";

async function getBalance({ exchange, userId }) {
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

    return await this.client.request(query, variables);
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

export { getBalance };

import VError from "verror";

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

    const { balance } = await this.client.request(query, variables);
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

import ServiceError from "cpz/error";
import Log from "cpz/log";
import { getPrivateConnector } from "../../global";
import CCXTPrivateProvider from "../../providers/ccxtPrivateProvider";

async function getBalance(_, { connectorInput, checkConnectorInput }) {
  try {
    if (connectorInput) {
      const connector = await getPrivateConnector(connectorInput);
      const result = await connector.getBalance(connectorInput.keys);
      return result;
    }
    if (checkConnectorInput) {
      const provider = new CCXTPrivateProvider({
        exchange: checkConnectorInput.exchange,
        userId: checkConnectorInput.userId,
        keys: {
          main: {
            APIKey: {
              encryptionKeyName: null,
              name: null,
              version: null,
              value: checkConnectorInput.APIKeyValue
            },
            APISecret: {
              encryptionKeyName: null,
              name: null,
              version: null,
              value: checkConnectorInput.APISecretValue
            }
          }
        },
        proxy: checkConnectorInput.proxy
      });
      await provider.init();
      const result = await provider.getBalance();
      Log.clearContext();
      return result;
    }
    Log.clearContext();
    return {
      success: false,
      error: {
        name: ServiceError.types.CONNECTOR_API_ERROR,
        message: "Wrong input."
      }
    };
  } catch (e) {
    const error = new ServiceError(
      {
        name: ServiceError.types.CONNECTOR_API_ERROR,
        cause: e
      },
      `Failed to process request. ${e.message}`
    );
    Log.clearContext();
    return {
      success: false,
      error: error.json
    };
  }
}

export default getBalance;

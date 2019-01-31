import { getPrivateConnector } from "../../global";
import CCXTPrivateProvider from "../../providers/ccxtPrivateProvider";

async function getBalance(
  _,
  { connectorInput, checkConnectorInput },
  { context }
) {
  if (connectorInput) {
    const connector = await getPrivateConnector(context, connectorInput);
    const result = await connector.getBalance(context, connectorInput.keys);
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
    await provider.init(context);
    const result = await provider.getBalance(context);
    return result;
  }
}

export { getBalance };

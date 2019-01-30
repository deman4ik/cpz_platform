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
          APIKey: checkConnectorInput.APIKey,
          APISecret: checkConnectorInput.APISecret
        }
      }
    });
    await provider.init();
    const result = await provider.getBalance(context);
    return result;
  }
}

export { getBalance };

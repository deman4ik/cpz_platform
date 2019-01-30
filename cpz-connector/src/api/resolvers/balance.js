import { getPrivateConnector } from "../../global";
import CCXTPrivateProvider from "../../providers/ccxtPrivateProvider";

async function getBalance(
  _,
  { connectorInput, checkConnectorInput },
  { context }
) {
  if (connectorInput) {
    const connector = await getPrivateConnector(connectorInput);
    const result = await connector.getBalance(context, connectorInput.keys);
    return result;
  }
  if (checkConnectorInput) {
    const provider = new CCXTPrivateProvider({
      exchange: checkConnectorInput.exchange,
      userId: checkConnectorInput.userId,
      keys: {
        main: {
          key: checkConnectorInput.key,
          secret: checkConnectorInput.secret
        }
      }
    });
    await provider.init();
    const result = await provider.getBalance(context);
    return result;
  }
}

export { getBalance };

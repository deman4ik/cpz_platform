import ServiceError from "cpz/error";
import Log from "cpz/log";
import { getPublicConnector } from "../../global";

async function getMarket(_, { connectorInput, asset, currency }) {
  try {
    const connector = await getPublicConnector(connectorInput);
    const result = await connector.getMarket({
      asset,
      currency
    });
    Log.clearContext();
    return result;
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

export default getMarket;

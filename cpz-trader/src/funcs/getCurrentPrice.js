import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import { createCurrentPriceSlug } from "cpz/config/state";
import MarketStorageClient from "cpz/tableStorage-client/market";
import marketTables, {
  getCurrentPrice
} from "cpz/tableStorage-client/market/currentPrices";
import { SERVICE_NAME } from "../config";
import { traderStateToCommonProps } from "../utils/helpers";

class GetCurrentPrice extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    try {
      // Check environment variables
      checkEnvVars(traderEnv.variables);
      // Configure Logger
      Log.config({
        key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
        serviceName: SERVICE_NAME
      });
      // Table Storage
      MarketStorageClient.init(process.env.AZ_STORAGE_MARKET_CS, marketTables);
    } catch (e) {
      Log.exception(e);
      throw e;
    }
  }

  async run(context, { state, data }) {
    try {
      Log.addContext(context, traderStateToCommonProps(state));
      Log.debug("getCurrentPice", state, data);
      const currentPrice = await getCurrentPrice(createCurrentPriceSlug(data));
      Log.debug("getCurrentPiceResult", currentPrice);
      if (!currentPrice) throw new Error("No current price");
      Log.clearContext();
      return currentPrice;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.TRADER_GET_CURRENT_PRICE_ERROR,
          cause: e,
          info: {
            ...traderStateToCommonProps(state),
            ...data
          }
        },
        "Failed to get current price"
      );
      Log.exception(error);
      Log.clearContext();
      throw error;
    }
  }
}

const func = new GetCurrentPrice();
export default func;

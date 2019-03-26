import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import { SERVICE_NAME } from "../config";
import Trader from "../state/trader";
import { traderStateToCommonProps } from "../utils/helpers";

class StartTrader extends BaseService {
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
    } catch (e) {
      Log.exception(e);
      throw e;
    }
  }

  async run(context, { state }) {
    try {
      Log.addContext(context, traderStateToCommonProps(state));
      Log.debug("startTrader", state);
      const trader = new Trader(state);
      Log.debug("init");
      trader.start();
      const newState = trader.currentState;
      Log.debug("startTraderResult", newState);
      Log.clearContext();
      return newState;
    } catch (e) {
      let error;
      if (e instanceof ServiceError) {
        error = e;
      } else {
        error = new ServiceError(
          {
            name: ServiceError.types.TRADER_START_ERROR,
            cause: e,
            info: {
              ...traderStateToCommonProps(state)
            }
          },
          "Failed to start trader"
        );
      }
      Log.exception(error);
      Log.clearContext();
      throw error;
    }
  }
}

const func = new StartTrader();
export default func;

import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import { SERVICE_NAME } from "../config";
import Trader from "../state/trader";
import { traderStateToCommonProps } from "../utils/helpers";

class HandleSignal extends BaseService {
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

  async run(context, { state, data }) {
    try {
      Log.addContext(context, traderStateToCommonProps(state));
      Log.debug("handleSignal", state, data);
      const trader = new Trader(state);
      trader.handleSignal(data);
      Log.debug("handleSignalResult", trader.currentState);
      Log.clearContext();
      return trader.currentState;
    } catch (e) {
      let error;
      if (e instanceof ServiceError) {
        error = e;
      } else {
        error = new ServiceError(
          {
            name: ServiceError.types.TRADER_HANDLE_SIGNAL_ERROR,
            cause: e,
            info: {
              ...traderStateToCommonProps(state),
              ...data
            }
          },
          "Failed to handle signal"
        );
      }
      Log.exception(error);
      Log.clearContext();
      throw error;
    }
  }
}

const func = new HandleSignal();
export default func;

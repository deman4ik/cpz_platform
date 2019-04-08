import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import { SERVICE_NAME, INTERNAL } from "../config";
import Trader from "../state/trader";
import { traderStateToCommonProps } from "../utils/helpers";

const {
  actions: {
    START,
    UPDATE,
    STOP,
    SIGNAL,
    PRICE,
    CHECK,
    ORDERS,
    CLOSE_ACTIVE_POSITIONS
  }
} = INTERNAL;

class ExecuteTrader {
  constructor() {
    this.init();
    this.allowedActions = [
      START,
      UPDATE,
      STOP,
      SIGNAL,
      PRICE,
      CHECK,
      ORDERS,
      CLOSE_ACTIVE_POSITIONS
    ];
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

  async run(context, { actionType, actionId, actionData, state }) {
    try {
      Log.addContext(context, traderStateToCommonProps(state));
      Log.debug("execute trader", actionType, actionId, actionData, state);
      if (!this.allowedActions.includes(actionType))
        throw new Error(`Invalid trader action "${actionType}"`);
      const trader = new Trader(state);
      if (actionId) trader.action = { actionId, actionType, actionData };
      trader[actionType](actionData);
      Log.clearContext();
      return trader.currentState;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.TRADER_EXECUTE_ERROR,
          cause: e,
          info: {
            ...traderStateToCommonProps(state),
            traderAction: { actionId, actionType, actionData }
          }
        },
        "Failed to execute trader"
      );

      Log.exception(error);
      Log.clearContext();
      throw error;
    }
  }
}

const func = new ExecuteTrader();
export default func;

import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import ControlStorageClient from "cpz/tableStorage-client/control";
import traderActionTables, {
  getNextTraderAction,
  deleteTraderAction
} from "cpz/tableStorage-client/control/traderActions";
import { SERVICE_NAME } from "../config";
import { traderStateToCommonProps } from "../utils/helpers";

class LoadAction extends BaseService {
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
      ControlStorageClient.init(
        process.env.AZ_STORAGE_CONTROL_CS,
        traderActionTables
      );
    } catch (e) {
      Log.exception(e);
      throw e;
    }
  }

  async run(context, { state, lastAction }) {
    try {
      Log.addContext(context, traderStateToCommonProps(state));
      Log.debug("loadAction", state);
      let nextAction;
      let loaded = false;
      /* eslint-disable no-await-in-loop */
      while (!loaded) {
        nextAction = await getNextTraderAction(state.taskId);

        loaded = true;
        // Если есть следующее действие
        if (nextAction) {
          await deleteTraderAction(nextAction);
          // Если есть предыдущее действие и id действий равны
          if (lastAction && lastAction.actionId === nextAction.id) {
            // грузим заново
            loaded = false;
            Log.warn("Action '%s' have already been processed", nextAction.id);
          }
        }
      }
      Log.debug("loadActionResult", nextAction);
      /* no-await-in-loop */
      Log.clearContext();
      return nextAction;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.TRADER_LOAD_ACTIONS_ERROR,
          cause: e,
          info: {
            ...traderStateToCommonProps(state)
          }
        },
        "Failed to load trader action"
      );
      Log.exception(error);
      Log.clearContext();
      throw error;
    }
  }
}

const func = new LoadAction();
export default func;

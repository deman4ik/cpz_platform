import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import ControlStorageClient from "cpz/tableStorage-client/control";
import traderTables, {
  saveTraderState
} from "cpz/tableStorage-client/control/traders";
import { SERVICE_NAME } from "../config";
import { traderStateToCommonProps } from "../utils/helpers";

class SaveState extends BaseService {
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
        traderTables
      );
    } catch (e) {
      Log.exception(e);
      throw e;
    }
  }

  async run(context, { state }) {
    try {
      Log.addContext(context, traderStateToCommonProps(state));
      Log.debug("saveState", state);
      await saveTraderState(state);
      Log.clearContext();
      return true;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.TRADER_SAVE_STATE_ERROR,
          cause: e,
          info: {
            ...traderStateToCommonProps(state)
          }
        },
        "Failed to save Trader state"
      );
      //   Log.error(error);
      Log.clearContext();
      throw error;
    }
  }
}

const func = new SaveState();
export default func;

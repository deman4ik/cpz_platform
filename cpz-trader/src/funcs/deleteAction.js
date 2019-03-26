import Log from "cpz/log";
import ServiceError from "cpz/error";
import { checkEnvVars } from "cpz/utils/environment";
import traderEnv from "cpz/config/environment/trader";
import BaseService from "cpz/services/baseService";
import ControlStorageClient from "cpz/tableStorage-client/control";
import traderActionTables, {
  deleteTraderAction
} from "cpz/tableStorage-client/control/traderActions";
import { SERVICE_NAME } from "../config";
import { traderStateToCommonProps } from "../utils/helpers";

class DeleteAction extends BaseService {
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

  async run(context, { state, data }) {
    try {
      Log.addContext(context, traderStateToCommonProps(state));
      Log.debug("deleteAction", state, data);
      await deleteTraderAction(data);
      Log.clearContext();
      return true;
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.TRADER_LOAD_ACTIONS_ERROR,
          cause: e,
          info: {
            ...traderStateToCommonProps(state),
            ...data
          }
        },
        "Failed to delate trader action"
      );

      Log.exception(error);
      Log.clearContext();
      throw error;
    }
  }
}

const func = new DeleteAction();
export default func;

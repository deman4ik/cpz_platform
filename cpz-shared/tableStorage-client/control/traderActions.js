import client from "./index";
import ServiceError from "../../error";
import { minArrOfObj } from "../../utils/helpers";

const TABLES = {
  STORAGE_TRADER_ACTIONS_TABLE: "TraderActions"
};

/**
 * Query Next Trader Action
 *
 * @param {string} taskId
 */
const getNextTraderAction = async taskId => {
  try {
    const actions = await client.getEntitiesByPartitionKey(
      TABLES.STORAGE_TRADER_ACTIONS_TABLE,
      taskId
    );
    if (actions && actions.length > 0) {
      return minArrOfObj(actions, "actionTime");
    }
    return null;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { taskId }
      },
      "Failed to read next trader action"
    );
  }
};

/**
 * Save Trader Action
 *
 * @param {object} action
 */
const saveTraderAction = async action =>
  client.insertOrMergeEntity(TABLES.STORAGE_TRADER_ACTIONS_TABLE, action);

/**
 * Delete Trader Action
 *
 * @param {object} action
 */
const deleteTraderAction = async ({ PartitionKey, RowKey }) =>
  client.deleteEntity(TABLES.STORAGE_TRADER_ACTIONS_TABLE, {
    PartitionKey,
    RowKey
  });

export { getNextTraderAction, saveTraderAction, deleteTraderAction };
export default Object.values(TABLES);

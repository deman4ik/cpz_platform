import client from "./index";
import ServiceError from "../../error";
import { minArrOfObj } from "../../utils/helpers";

const TABLES = {
  STORAGE_TRADER_ACTIONS_TABLE: "TraderActions"
};

/**
 * Query Trader Action by Keys
 *
 * @param {Object}
 *  @property {string} RowKey
 *  @property {string} PartitionKey
 */
const getTraderActionByKeys = async ({ PartitionKey, RowKey }) =>
  client.getEntityByKeys(TABLES.STORAGE_TRADER_ACTIONS_TABLE, {
    RowKey,
    PartitionKey
  });

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

const traderHasActions = async taskId => {
  try {
    const actions = await client.getEntitiesByPartitionKey(
      TABLES.STORAGE_TRADER_ACTIONS_TABLE,
      taskId
    );
    if (actions && actions.length > 0) {
      return true;
    }
    return false;
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

const deleteTraderActions = async taskId => {
  const actions = client.getEntitiesByPartitionKey(
    TABLES.STORAGE_TRADER_ACTIONS_TABLE,
    taskId
  );

  if (actions && Array.isArray(actions) && actions.length > 0) {
    await Promise.all(actions.map(async action => deleteTraderAction(action)));
  }
};
export {
  getTraderActionByKeys,
  getNextTraderAction,
  traderHasActions,
  saveTraderAction,
  deleteTraderAction,
  deleteTraderActions
};
export default Object.values(TABLES);

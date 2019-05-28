import client from "./index";
import ServiceError from "../../error";
import { minArrOfObj } from "../../utils/helpers";

const TABLES = {
  STORAGE_CANDLEBATCHER_ACTIONS_TABLE: "CandlebatcherActions"
};

/**
 * Query Candlebatcher Action by Keys
 *
 * @param {Object}
 *  @property {string} RowKey
 *  @property {string} PartitionKey
 */
const getCandlebatcherActionByKeys = async ({ PartitionKey, RowKey }) =>
  client.getEntityByKeys(TABLES.STORAGE_CANDLEBATCHER_ACTIONS_TABLE, {
    RowKey,
    PartitionKey
  });

/**
 * Query Next Candlebatcher Action
 *
 * @param {string} taskId
 */
const getNextCandlebatcherAction = async taskId => {
  try {
    const actions = await client.getEntitiesByPartitionKey(
      TABLES.STORAGE_CANDLEBATCHER_ACTIONS_TABLE,
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
      "Failed to read next candlebatcher action"
    );
  }
};

const candlebatcherHasActions = async taskId => {
  try {
    const actions = await client.getEntitiesByPartitionKey(
      TABLES.STORAGE_CANDLEBATCHER_ACTIONS_TABLE,
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
      "Failed to read next candlebatcher action"
    );
  }
};
/**
 * Save Candlebatcher Action
 *
 * @param {object} action
 */
const saveCandlebatcherAction = async action =>
  client.insertOrMergeEntity(
    TABLES.STORAGE_CANDLEBATCHER_ACTIONS_TABLE,
    action
  );

/**
 * Delete Candlebatcher Action
 *
 * @param {object} action
 */
const deleteCandlebatcherAction = async ({ PartitionKey, RowKey }) =>
  client.deleteEntity(TABLES.STORAGE_CANDLEBATCHER_ACTIONS_TABLE, {
    PartitionKey,
    RowKey
  });

const deleteCandlebatcherActions = async taskId => {
  const actions = client.getEntitiesByPartitionKey(
    TABLES.STORAGE_CANDLEBATCHER_ACTIONS_TABLE,
    taskId
  );

  if (actions && Array.isArray(actions) && actions.length > 0) {
    await Promise.all(
      actions.map(async action => deleteCandlebatcherAction(action))
    );
  }
};

export {
  getCandlebatcherActionByKeys,
  getNextCandlebatcherAction,
  candlebatcherHasActions,
  saveCandlebatcherAction,
  deleteCandlebatcherAction,
  deleteCandlebatcherActions
};
export default Object.values(TABLES);

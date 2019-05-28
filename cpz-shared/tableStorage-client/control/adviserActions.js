import client from "./index";
import ServiceError from "../../error";
import { minArrOfObj } from "../../utils/helpers";

const TABLES = {
  STORAGE_ADVISER_ACTIONS_TABLE: "AdviserActions"
};

/**
 * Query Adviser Action by Keys
 *
 * @param {Object}
 *  @property {string} RowKey
 *  @property {string} PartitionKey
 */
const getAdviserActionByKeys = async ({ PartitionKey, RowKey }) =>
  client.getEntityByKeys(TABLES.STORAGE_ADVISER_ACTIONS_TABLE, {
    RowKey,
    PartitionKey
  });

/**
 * Query Next Adviser Action
 *
 * @param {string} taskId
 */
const getNextAdviserAction = async taskId => {
  try {
    const actions = await client.getEntitiesByPartitionKey(
      TABLES.STORAGE_ADVISER_ACTIONS_TABLE,
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
      "Failed to read next adviser action"
    );
  }
};

const adviserHasActions = async taskId => {
  try {
    const actions = await client.getEntitiesByPartitionKey(
      TABLES.STORAGE_ADVISER_ACTIONS_TABLE,
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
      "Failed to read next adviser action"
    );
  }
};
/**
 * Save Adviser Action
 *
 * @param {object} action
 */
const saveAdviserAction = async action =>
  client.insertOrMergeEntity(TABLES.STORAGE_ADVISER_ACTIONS_TABLE, action);

/**
 * Delete Adviser Action
 *
 * @param {object} action
 */
const deleteAdviserAction = async ({ PartitionKey, RowKey }) =>
  client.deleteEntity(TABLES.STORAGE_ADVISER_ACTIONS_TABLE, {
    PartitionKey,
    RowKey
  });

const deleteAdviserActions = async taskId => {
  const actions = client.getEntitiesByPartitionKey(
    TABLES.STORAGE_ADVISER_ACTIONS_TABLE,
    taskId
  );

  if (actions && Array.isArray(actions) && actions.length > 0) {
    await Promise.all(actions.map(async action => deleteAdviserAction(action)));
  }
};

export {
  getAdviserActionByKeys,
  getNextAdviserAction,
  adviserHasActions,
  saveAdviserAction,
  deleteAdviserAction,
  deleteAdviserActions
};
export default Object.values(TABLES);

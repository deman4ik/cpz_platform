import azure from "azure-storage";
import client from "./index";
import ServiceError from "../../error";

const { TableQuery, TableUtilities } = azure;

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
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      taskId
    );
    const query = new TableQuery().where(partitionKeyFilter);
    const actions = await client.queryEntities(
      TABLES.STORAGE_TRADER_ACTIONS_TABLE,
      query
    );
    if (actions && actions.length > 0) return actions[0];
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
const deleteTraderAction = async action =>
  client.deleteEntity(TABLES.STORAGE_TRADER_ACTIONS_TABLE, action);

export { getNextTraderAction, saveTraderAction, deleteTraderAction };
export default Object.values(TABLES);

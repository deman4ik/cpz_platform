import azure from "azure-storage";
import client from "./index";
import ServiceError from "../../error";

const TABLES = {
  STORAGE_BACKTESTS_TABLE: "Backtests"
};

const { TableQuery, TableUtilities } = azure;

client.createTableIfNotExists(TABLES.STORAGE_BACKTESTS_TABLE);
/**
 * Query Backtest State by uniq Task ID
 *
 * @param {string} taskId
 * @returns {Object}
 */
const getBacktestById = async taskId =>
  client.getEntityByRowKey(TABLES.STORAGE_BACKTESTS_TABLE, taskId);

/**
 * Find Backtest by any service Id
 *
 * @param {Object} input
 *  @property {string} input.taskId Service taskId
 *  @property {string} input.serviceName Service Name
 */
const findBacktestsByServiceId = async ({ taskId, serviceName }) => {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        `${serviceName}Id`,
        TableUtilities.QueryComparisons.EQUAL,
        taskId
      )
    );
    return await client.queryEntities(TABLES.STORAGE_BACKTESTS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { taskId, serviceName }
      },
      "Failed to read backtests state"
    );
  }
};
/**
 * Creates new or update current Backtest State
 *
 * @param {Object} state
 */
const saveBacktestState = async state =>
  client.insertOrMergeEntity(TABLES.STORAGE_BACKTESTS_TABLE, state);

/**
 * Delete Backtest state and all Backtester Items
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deleteBacktestState = async ({ RowKey, PartitionKey, metadata }) => {
  await client.deleteEntity(TABLES.STORAGE_BACKTESTS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });
};
export {
  getBacktestById,
  findBacktestsByServiceId,
  saveBacktestState,
  deleteBacktestState
};
export default Object.values(TABLES);

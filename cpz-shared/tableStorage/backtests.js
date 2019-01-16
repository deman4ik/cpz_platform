import azure from "azure-storage";
import VError from "verror";
import { STORAGE_BACKTESTS_TABLE } from "./tables";
import tableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;
tableStorage.createTableIfNotExists(STORAGE_BACKTESTS_TABLE);
/**
 * Query Backtest State by uniq Task ID
 *
 * @param {string} taskId
 * @returns {BacktestState}
 */
const getBacktestById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_BACKTESTS_TABLE, taskId);

/**
 * Find Backtest by any service Id
 *
 * @param {object} input
 * @param {string} input.taskId Service taskId
 * @param {string} input.serviceName Service Name
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
    return await tableStorage.queryEntities(STORAGE_BACKTESTS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
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
 * @param {BacktestState} state
 */
const saveBacktestState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_BACKTESTS_TABLE, state);

/**
 * Delete Backtest state and all Backtester Items
 *
 * @param {Object} input
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteBacktestState = async ({ RowKey, PartitionKey, metadata }) => {
  await tableStorage.deleteEntity(STORAGE_BACKTESTS_TABLE, {
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

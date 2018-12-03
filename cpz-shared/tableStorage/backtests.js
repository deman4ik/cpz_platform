import { STORAGE_BACKTESTS_TABLE, STORAGE_BACKTESTITEMS_TABLE } from "./tables";
import tableStorage from "./tableStorage";

tableStorage.createTableIfNotExists(STORAGE_BACKTESTS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTITEMS_TABLE);

/**
 * Query Backtester State by uniq Task ID
 *
 * @param {string} taskId
 * @returns {BacktesterState}
 */
const getBacktesterById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_BACKTESTS_TABLE, taskId);

/**
 * Creates new or update current Backtester State
 *
 * @param {BacktesterState} state
 */
const saveBacktesterState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_BACKTESTS_TABLE, state);

/**
 * Updates current Backtester State
 *
 * @param {BacktesterState} state
 */
const saveBacktesterItem = async item =>
  tableStorage.insertOrMergeEntity(STORAGE_BACKTESTITEMS_TABLE, item);

/**
 * Delete Backtester state and all Backtester Items
 *
 * @param {Object} input
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteBacktesterState = async ({ RowKey, PartitionKey, metadata }) => {
  const items = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTITEMS_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTITEMS_TABLE, items);
  await tableStorage.deleteEntity(STORAGE_BACKTESTS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });
};
export {
  getBacktesterById,
  saveBacktesterState,
  saveBacktesterItem,
  deleteBacktesterState
};

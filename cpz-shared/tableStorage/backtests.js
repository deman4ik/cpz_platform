import {
  STORAGE_BACKTESTS_TABLE,
  STORAGE_BACKTESTITEMS_TABLE,
  STORAGE_BACKTESTSTRATLOG_TABLE,
  STORAGE_BACKTESTSIGNALS_TABLE,
  STORAGE_BACKTESTORDERS_TABLE,
  STORAGE_BACKTESTPOSITIONS_TABLE
} from "./tables";
import tableStorage from "./tableStorage";

tableStorage.createTableIfNotExists(STORAGE_BACKTESTS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTITEMS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTSTRATLOG_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTSIGNALS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTORDERS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTPOSITIONS_TABLE);
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
 * Saves backtestitem
 *
 * @param {object} state
 */
const saveBacktesterItems = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTITEMS_TABLE, items);

/**
 * Saves backtest strategy logs
 *
 * @param {object} state
 */
const saveBacktesterStratLogs = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTSTRATLOG_TABLE, items);

/**
 * Saves backtest signals
 *
 * @param {SignalState} state
 */
const saveBacktesterSignals = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTSIGNALS_TABLE, items);

/**
 * Saves backtest orders
 *
 * @param {OderState} state
 */
const saveBacktesterOrders = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTORDERS_TABLE, items);

/**
 * Saves backtest positions
 *
 * @param {PositionState} state
 */
const saveBacktesterPositions = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTPOSITIONS_TABLE, items);
/**
 * Delete Backtester state and all Backtester Items
 *
 * @param {Object} input
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteBacktesterState = async ({ RowKey, PartitionKey }) => {
  const items = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTITEMS_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTITEMS_TABLE, items);

  const strLogs = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTSTRATLOG_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTSTRATLOG_TABLE, strLogs);

  const signals = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTSIGNALS_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTSIGNALS_TABLE, signals);

  const orders = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTORDERS_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTORDERS_TABLE, orders);

  const positions = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTPOSITIONS_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTPOSITIONS_TABLE, positions);

  await tableStorage.deleteEntity(STORAGE_BACKTESTS_TABLE, {
    RowKey,
    PartitionKey
  });
};
export {
  getBacktesterById,
  saveBacktesterState,
  saveBacktesterItems,
  saveBacktesterStratLogs,
  saveBacktesterSignals,
  saveBacktesterOrders,
  saveBacktesterPositions,
  deleteBacktesterState
};

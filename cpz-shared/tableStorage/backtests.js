import {
  STORAGE_BACKTESTS_TABLE,
  STORAGE_BACKTESTSTRATLOG_TABLE,
  STORAGE_BACKTESTSIGNALS_TABLE,
  STORAGE_BACKTESTORDERS_TABLE,
  STORAGE_BACKTESTPOSITIONS_TABLE
} from "./tables";
import tableStorage from "./tableStorage";

tableStorage.createTableIfNotExists(STORAGE_BACKTESTS_TABLE);
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
 * Saves backtest strategy logs
 *
 * @param {object} state
 */
const saveBacktesterStratLog = async item =>
  tableStorage.insertOrMergeEntity(STORAGE_BACKTESTSTRATLOG_TABLE, item);

/**
 * Saves backtest signals
 *
 * @param {SignalState} state
 */
const saveBacktesterSignal = async item =>
  tableStorage.insertOrMergeEntity(STORAGE_BACKTESTSIGNALS_TABLE, item);

/**
 * Saves backtest orders
 *
 * @param {OderState} state
 */
const saveBacktesterOrder = async item =>
  tableStorage.insertOrMergeEntity(STORAGE_BACKTESTORDERS_TABLE, item);

/**
 * Saves backtest positions
 *
 * @param {PositionState} state
 */
const saveBacktesterPosition = async item =>
  tableStorage.insertOrMergeEntity(STORAGE_BACKTESTPOSITIONS_TABLE, item);
/**
 * Delete Backtester state and all Backtester Items
 *
 * @param {Object} input
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteBacktesterState = async ({ RowKey, PartitionKey, metadata }) => {
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
    PartitionKey,
    metadata
  });
};
export {
  getBacktesterById,
  saveBacktesterState,
  saveBacktesterStratLog,
  saveBacktesterSignal,
  saveBacktesterOrder,
  saveBacktesterPosition,
  deleteBacktesterState
};

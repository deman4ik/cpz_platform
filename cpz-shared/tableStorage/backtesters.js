import {
  STORAGE_BACKTESTERS_TABLE,
  STORAGE_BACKTESTERITEMS_TABLE,
  STORAGE_BACKTESTERSTRATLOG_TABLE,
  STORAGE_BACKTESTERSIGNALS_TABLE,
  STORAGE_BACKTESTERORDERS_TABLE,
  STORAGE_BACKTESTERPOSITIONS_TABLE
} from "./tables";
import TableStorage from "./tableStorage";

const tableStorage = new TableStorage(process.env.AZ_STORAGE_BACKTESTER_CS);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTERS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTERITEMS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTERSTRATLOG_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTERSIGNALS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTERORDERS_TABLE);
tableStorage.createTableIfNotExists(STORAGE_BACKTESTERPOSITIONS_TABLE);
/**
 * Query Backtester State by uniq Task ID
 *
 * @param {string} taskId
 * @returns {BacktesterState}
 */
const getBacktesterById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_BACKTESTERS_TABLE, taskId);

/**
 * Creates new or update current Backtester State
 *
 * @param {BacktesterState} state
 */
const saveBacktesterState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_BACKTESTERS_TABLE, state);

/**
 * Saves backtestitem
 *
 * @param {object} state
 */
const saveBacktesterItems = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTERITEMS_TABLE, items);

/**
 * Saves backtest strategy logs
 *
 * @param {object} state
 */
const saveBacktesterStratLogs = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTERSTRATLOG_TABLE, items);

/**
 * Saves backtest signals
 *
 * @param {SignalState} state
 */
const saveBacktesterSignals = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTERSIGNALS_TABLE, items);

/**
 * Saves backtest orders
 *
 * @param {OderState} state
 */
const saveBacktesterOrders = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTERORDERS_TABLE, items);

/**
 * Saves backtest positions
 *
 * @param {PositionState} state
 */
const saveBacktesterPositions = async items =>
  tableStorage.insertOrMergeArray(STORAGE_BACKTESTERPOSITIONS_TABLE, items);
/**
 * Delete Backtester state and all Backtester Items
 *
 * @param {Object} input
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteBacktesterState = async ({ RowKey, PartitionKey, metadata }) => {
  const items = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTERITEMS_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTERITEMS_TABLE, items);

  const strLogs = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTERSTRATLOG_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTERSTRATLOG_TABLE, strLogs);

  const signals = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTERSIGNALS_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTERSIGNALS_TABLE, signals);

  const orders = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTERORDERS_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTERORDERS_TABLE, orders);

  const positions = await tableStorage.getEntitiesByPartitionKey(
    STORAGE_BACKTESTERPOSITIONS_TABLE,
    RowKey
  );
  await tableStorage.deleteArray(STORAGE_BACKTESTERPOSITIONS_TABLE, positions);

  await tableStorage.deleteEntity(STORAGE_BACKTESTERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
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

import client from "./index";

const TABLES = {
  STORAGE_BACKTESTERS_TABLE: "Backtesters", // Backtester
  STORAGE_BACKTESTERITEMS_TABLE: "BacktesterItems", // Backtester
  STORAGE_BACKTESTERSTRATLOG_TABLE: "BacktesterStratLogs", // Backtester
  STORAGE_BACKTESTERSIGNALS_TABLE: "BacktesterSignals", // Backtester
  STORAGE_BACKTESTERORDERS_TABLE: "BacktesterOrders", // Backtester
  STORAGE_BACKTESTERPOSITIONS_TABLE: "BacktesterPositions" // Backtester
};
/**
 * Query Backtester State by uniq Task ID
 *
 * @param {string} taskId
 * @returns {Object}
 */
const getBacktesterById = async taskId =>
  client.getEntityByRowKey(TABLES.STORAGE_BACKTESTERS_TABLE, taskId);

/**
 * Creates new or update current Backtester State
 *
 * @param {Object} state
 */
const saveBacktesterState = async state =>
  client.insertOrMergeEntity(TABLES.STORAGE_BACKTESTERS_TABLE, state);

/**
 * Saves backtestitem
 *
 * @param {Object} state
 */
const saveBacktesterItems = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERITEMS_TABLE, items);

/**
 * Saves backtest strategy logs
 *
 * @param {Object} state
 */
const saveBacktesterStratLogs = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERSTRATLOG_TABLE, items);

/**
 * Saves backtest signals
 *
 * @param {Object} state
 */
const saveBacktesterSignals = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERSIGNALS_TABLE, items);

/**
 * Saves backtest orders
 *
 * @param {Object} state
 */
const saveBacktesterOrders = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERORDERS_TABLE, items);

/**
 * Saves backtest positions
 *
 * @param {Object} state
 */
const saveBacktesterPositions = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERPOSITIONS_TABLE, items);
/**
 * Delete Backtester state and all Backtester Items
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deleteBacktesterState = async ({ RowKey, PartitionKey, metadata }) => {
  const items = await client.getEntitiesByPartitionKey(
    TABLES.STORAGE_BACKTESTERITEMS_TABLE,
    RowKey
  );
  await client.deleteArray(TABLES.STORAGE_BACKTESTERITEMS_TABLE, items);

  const strLogs = await client.getEntitiesByPartitionKey(
    TABLES.STORAGE_BACKTESTERSTRATLOG_TABLE,
    RowKey
  );
  await client.deleteArray(TABLES.STORAGE_BACKTESTERSTRATLOG_TABLE, strLogs);

  const signals = await client.getEntitiesByPartitionKey(
    TABLES.STORAGE_BACKTESTERSIGNALS_TABLE,
    RowKey
  );
  await client.deleteArray(TABLES.STORAGE_BACKTESTERSIGNALS_TABLE, signals);

  const orders = await client.getEntitiesByPartitionKey(
    TABLES.STORAGE_BACKTESTERORDERS_TABLE,
    RowKey
  );
  await client.deleteArray(TABLES.STORAGE_BACKTESTERORDERS_TABLE, orders);

  const positions = await client.getEntitiesByPartitionKey(
    TABLES.STORAGE_BACKTESTERPOSITIONS_TABLE,
    RowKey
  );
  await client.deleteArray(TABLES.STORAGE_BACKTESTERPOSITIONS_TABLE, positions);

  await client.deleteEntity(TABLES.STORAGE_BACKTESTERS_TABLE, {
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
export default Object.values(TABLES);

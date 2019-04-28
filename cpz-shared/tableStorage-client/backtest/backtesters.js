import client from "./index";

const TABLES = {
  STORAGE_BACKTESTERS_TABLE: "Backtesters",
  STORAGE_BACKTESTERITEMS_TABLE: "BacktesterItems",
  STORAGE_BACKTESTERSTRATLOG_TABLE: "BacktesterStratLogs",
  STORAGE_BACKTESTERSIGNALS_TABLE: "BacktesterSignals",
  STORAGE_BACKTESTERORDERS_TABLE: "BacktesterOrders",
  STORAGE_BACKTESTERPOSITIONS_TABLE: "BacktesterPositions",
  STORAGE_BACKTESTERERRORS_TABLE: "BacktesterErrors"
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
 * @param {[Object]} items
 */
const saveBacktesterItems = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERITEMS_TABLE, items);

/**
 * Saves backtest strategy logs
 *
 * @param {[Object]} items
 */
const saveBacktesterStratLogs = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERSTRATLOG_TABLE, items);

/**
 * Saves backtest signals
 *
 * @param {[Object]} items
 */
const saveBacktesterSignals = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERSIGNALS_TABLE, items);

/**
 * Saves backtest orders
 *
 * @param {[Object]} items
 */
const saveBacktesterOrders = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERORDERS_TABLE, items);

/**
 * Saves backtest positions
 *
 * @param {[Object]} items
 */
const saveBacktesterPositions = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERPOSITIONS_TABLE, items);

/**
 * Saves backtest errors
 *
 * @param {[Object]} items
 */
const saveBacktesterErrors = async items =>
  client.insertOrMergeArray(TABLES.STORAGE_BACKTESTERERRORS_TABLE, items);

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

  const errors = await client.getEntitiesByPartitionKey(
    TABLES.STORAGE_BACKTESTERERRORS_TABLE,
    RowKey
  );
  await client.deleteArray(TABLES.STORAGE_BACKTESTERERRORS_TABLE, errors);

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
  saveBacktesterErrors,
  deleteBacktesterState
};
export default Object.values(TABLES);

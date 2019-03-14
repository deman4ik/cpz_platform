const TABLES = {
  STORAGE_SIGNALSPENDING_TABLE: "SignalsPending"
};
/**
 * Query pending signals
 *
 * @param {string} traderId - Trader task id
 * @returns {Object}
 */
const getPendingSignalsByTraderId = async traderId =>
  this.client.getEntitiesByPartitionKey(
    TABLES.STORAGE_SIGNALSPENDING_TABLE,
    traderId
  );

/**
 * Save pending signal
 *
 * @param {Object} state
 */
const savePendingSignal = async state =>
  this.client.insertOrMergeEntity(TABLES.STORAGE_SIGNALSPENDING_TABLE, state);

/**
 * Delete pending signal
 *
 * @param {Object} signal
 */
const deletePendingSignal = async signal =>
  this.client.deleteEntity(TABLES.STORAGE_SIGNALSPENDING_TABLE, signal);

export { getPendingSignalsByTraderId, savePendingSignal, deletePendingSignal };
export default Object.values(TABLES);

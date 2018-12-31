import { STORAGE_SIGNALSPENDING_TABLE } from "./tables";
import tableStorage from "./tableStorage";

tableStorage.createTableIfNotExists(STORAGE_SIGNALSPENDING_TABLE);

/**
 * Query pending signals
 *
 * @param {string} traderId - Trader task id
 * @returns {PendingSignal}
 */
const getPendingSignalsByTraderId = async traderId =>
  tableStorage.getEntitiesByPartitionKey(
    STORAGE_SIGNALSPENDING_TABLE,
    traderId
  );

/**
 * Save pending signal
 *
 * @param {PendingSignal} state
 */
const savePendingSignal = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_SIGNALSPENDING_TABLE, state);

/**
 * Delete pending signal
 *
 * @param {PendingSignal} signal
 */
const deletePendingSignal = async signal =>
  tableStorage.deleteEntity(STORAGE_SIGNALSPENDING_TABLE, signal);

export { getPendingSignalsByTraderId, savePendingSignal, deletePendingSignal };

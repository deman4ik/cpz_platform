import azure from "azure-storage";
import VError from "verror";
import { STATUS_STARTED, STATUS_BUSY } from "../config/state";
import { STORAGE_TRADERS_TABLE } from "./tables";
import tableStorage from "./tableStorage";
import { deletePositionsState } from "./positions";

const { TableQuery, TableUtilities } = azure;
tableStorage.createTableIfNotExists(STORAGE_TRADERS_TABLE);

/**
 * Query trader by task id
 *
 * @param {string} taskId
 * @returns {TraderState}
 */
const getTraderById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_TRADERS_TABLE, taskId);

/**
 * Query active Traders
 *
 * @param {string} slug
 * @returns {TraderState[]}
 */
const getActiveTradersBySlug = async slug => {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const startedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );
    const busyStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_BUSY
    );
    const statusFilter = TableQuery.combineFilters(
      startedStatusFilter,
      TableUtilities.TableOperators.OR,
      busyStatusFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        partitionKeyFilter,
        TableUtilities.TableOperators.AND,
        statusFilter
      )
    );
    return await tableStorage.queryEntities(STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error,
        info: slug
      },
      'Failed to read traders by slug "%s"',
      slug
    );
  }
};

/**
 * Save Trader state
 *
 * @param {TraderState} state
 */
const saveTraderState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_TRADERS_TABLE, state);

/**
 * Update Trader state
 *
 * @param {TraderState} state
 */
const updateTraderState = async state =>
  tableStorage.mergeEntity(STORAGE_TRADERS_TABLE, state);

/**
 * Delete Trader state with all Positions
 *
 * @param {Object} input
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteTraderState = async ({ RowKey, PartitionKey, metadata }) => {
  try {
    await deletePositionsState(RowKey);
    await tableStorage.deleteEntity(STORAGE_TRADERS_TABLE, {
      RowKey,
      PartitionKey,
      metadata
    });
  } catch (error) {
    if (error instanceof VError) throw error;
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: {
          RowKey,
          PartitionKey
        }
      },
      "Failed to delete Trader state"
    );
  }
};

export {
  getTraderById,
  getActiveTradersBySlug,
  saveTraderState,
  updateTraderState,
  deleteTraderState
};

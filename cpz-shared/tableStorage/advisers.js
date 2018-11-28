import azure from "azure-storage";
import VError from "verror";
import { STATUS_STARTED, STATUS_BUSY } from "../config/state";
import { STORAGE_ADVISERS_TABLE } from "./tables";
import tableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;
tableStorage.createTableIfNotExists(STORAGE_ADVISERS_TABLE);

/**
 * Query Adviser State by uniq Task ID
 *
 * @param {string} taskId
 * @returns {AdviserState}
 */
const getAdviserById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_ADVISERS_TABLE, taskId);

/**
 * Query Active and Busy Advisers by Slug
 *
 * @param {string} slug
 * @returns {AdviserState[]}
 */
const getActiveAdvisersBySlug = async slug => {
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
    return await tableStorage.queryEntities(STORAGE_ADVISERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: slug
      },
      'Failed to read active advisers by slug "%s"',
      slug
    );
  }
};
/**
 * Creates new or update current Adviser State
 *
 * @param {AdviserState} state
 */
const saveAdviserState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_ADVISERS_TABLE, state);

/**
 * Updates current Adviser State
 *
 * @param {AdviserState} state
 */
const updateAdviserState = async state =>
  tableStorage.mergeEntity(STORAGE_ADVISERS_TABLE, state);

/**
 * Delete Adviser state
 *
 * @param {string} taskId
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteAdviserState = async ({ RowKey, PartitionKey, metadata }) =>
  tableStorage.deleteEntity(STORAGE_ADVISERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getAdviserById,
  getActiveAdvisersBySlug,
  saveAdviserState,
  updateAdviserState,
  deleteAdviserState
};
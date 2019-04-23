import azure from "azure-storage";
import client from "./index";
import ServiceError from "../../error";
import { STATUS_STARTED, STATUS_BUSY } from "../../config/state";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_ADVISERS_TABLE: "Advisers"
};

/**
 * Query Adviser State by uniq Task ID
 *
 * @param {string} taskId
 * @returns {Object}
 */
const getAdviserById = async taskId =>
  client.getEntityByRowKey(TABLES.STORAGE_ADVISERS_TABLE, taskId);

/**
 * Query Active and Busy Advisers by Slug
 *
 * @param {string} slug
 * @returns {Object[]}
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
    return await client.queryEntities(TABLES.STORAGE_ADVISERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { slug }
      },
      'Failed to read active advisers by slug "%s"',
      slug
    );
  }
};

/**
 * Query Started Advisers
 *
 * @returns {Object[]}
 */
const getStartedAdvisers = async () => {
  try {
    const startedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );

    const query = new TableQuery().where(startedStatusFilter);
    return await client.queryEntities(TABLES.STORAGE_ADVISERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: {}
      },
      "Failed to read started advisers"
    );
  }
};
/**
 * Creates new or update current Adviser State
 *
 * @param {Object} state
 */
const saveAdviserState = async state =>
  client.insertOrMergeEntity(TABLES.STORAGE_ADVISERS_TABLE, state);

/**
 * Updates current Adviser State
 *
 * @param {Object} state
 */
const updateAdviserState = async state =>
  client.mergeEntity(TABLES.STORAGE_ADVISERS_TABLE, state);

/**
 * Delete Adviser state
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deleteAdviserState = async ({ RowKey, PartitionKey, metadata }) =>
  client.deleteEntity(TABLES.STORAGE_ADVISERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getAdviserById,
  getActiveAdvisersBySlug,
  getStartedAdvisers,
  saveAdviserState,
  updateAdviserState,
  deleteAdviserState
};
export default Object.values(TABLES);

import azure from "azure-storage";
import client from "./index";
import ServiceError from "../../error";
import { STATUS_STARTED, STATUS_PAUSED } from "../../config/state";

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
    const pausedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_PAUSED
    );
    const statusFilter = TableQuery.combineFilters(
      startedStatusFilter,
      TableUtilities.TableOperators.OR,
      pausedStatusFilter
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
 * Query Active Advisers
 *
 * @returns {Object[]}
 */
const getActiveAdvisers = async () => {
  try {
    const startedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );
    const pausedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_PAUSED
    );
    const statusFilter = TableQuery.combineFilters(
      startedStatusFilter,
      TableUtilities.TableOperators.OR,
      pausedStatusFilter
    );
    const query = new TableQuery().where(statusFilter);
    return await client.queryEntities(TABLES.STORAGE_ADVISERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: {}
      },
      "Failed to read active advisers"
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
// TODO: getAdvisersWithActions

/**
 * Query Paused Advisers
 *
 * @returns {Object[]}
 */
const getPausedAdvisers = async () => {
  try {
    const startedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_PAUSED
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
      "Failed to read paused advisers"
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
  getActiveAdvisers,
  getStartedAdvisers,
  getPausedAdvisers,
  saveAdviserState,
  updateAdviserState,
  deleteAdviserState
};
export default Object.values(TABLES);

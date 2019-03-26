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
 * Find Adviser
 *
 * @param {Object} input
 *  @property {string} input.robotId - Robot Id
 * @returns {Object}
 */
const findAdviser = async ({ robotId }) => {
  try {
    const robotIdFilter = TableQuery.stringFilter(
      "robotId",
      TableUtilities.QueryComparisons.EQUAL,
      robotId
    );
    const query = new TableQuery().where(robotIdFilter);
    const advisers = await client.queryEntities(
      TABLES.STORAGE_ADVISERS_TABLE,
      query
    );
    if (advisers.length > 0) return advisers[0];
    return null;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { robotId }
      },
      "Failed to read adviser state"
    );
  }
};

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
  findAdviser,
  getActiveAdvisersBySlug,
  saveAdviserState,
  updateAdviserState,
  deleteAdviserState
};
export default Object.values(TABLES);

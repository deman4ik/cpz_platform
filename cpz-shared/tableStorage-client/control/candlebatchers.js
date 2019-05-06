import azure from "azure-storage";
import client from "./index";
import ServiceError from "../../error";
import { STATUS_STARTED, STATUS_BUSY } from "../../config/state";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_CANDLEBATCHERS_TABLE: "Candlebatchers"
};
/**
 * Query Candlebatcher State by uniq Task ID
 *
 * @param {string} taskId
 * @returns {Object}
 */
const getCandlebatcherById = async taskId =>
  client.getEntityByRowKey(TABLES.STORAGE_CANDLEBATCHERS_TABLE, taskId);

/**
 * Query Active Candlebatchers
 *
 * @returns {Object[]}
 */
const getActiveCandlebatchers = async () => {
  try {
    const startedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );

    const query = new TableQuery().where(startedStatusFilter);
    return await client.queryEntities(
      TABLES.STORAGE_CANDLEBATCHERS_TABLE,
      query
    );
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error
      },
      "Failed to load started candlebatchers"
    );
  }
};

/**
 * Find Candlebatcher by slug
 * @param {Object} slug - Candlebatcher Slug
 * @returns {Object[]}
 */
const findCandlebatcher = async slug =>
  client.getEntityByPartitionKey(TABLES.STORAGE_CANDLEBATCHERS_TABLE, slug);

/**
 * Creates new or update current Candlebatcher State
 *
 * @param {Object} state
 */
const saveCandlebatcherState = async state =>
  client.insertOrMergeEntity(TABLES.STORAGE_CANDLEBATCHERS_TABLE, state);

/**
 * Updates current Candlebatcher State
 *
 * @param {Object} state
 */
const updateCandlebatcherState = async state =>
  client.mergeEntity(TABLES.STORAGE_CANDLEBATCHERS_TABLE, state);

/**
 * Delete Candlebatcher state
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deleteCandlebatcherState = async ({ RowKey, PartitionKey, metadata }) =>
  client.deleteEntity(TABLES.STORAGE_CANDLEBATCHERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getCandlebatcherById,
  getActiveCandlebatchers,
  findCandlebatcher,
  saveCandlebatcherState,
  updateCandlebatcherState,
  deleteCandlebatcherState
};
export default Object.values(TABLES);

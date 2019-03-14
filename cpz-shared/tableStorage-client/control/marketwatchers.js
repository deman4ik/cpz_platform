import azure from "azure-storage";
import ServiceError from "../../error";
import { STATUS_STOPPED } from "../../config/state";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_MARKETWATCHERS_TABLE: "Marketwatchers"
};

/**
 * Query Marketwatcher state by uniq id
 *
 * @param {string} taskId - Marketwatcher task id
 */
const getMarketwatcherById = async taskId =>
  this.market.getEntityByRowKey(TABLES.STORAGE_MARKETWATCHERS_TABLE, taskId);

/**
 * Query Started Marketwatchers
 *
 * @returns {Object[]}
 */
const getStartedMarketwatchers = async () => {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "status",
        TableUtilities.QueryComparisons.NOT_EQUAL,
        STATUS_STOPPED
      )
    );
    return await this.market.queryEntities(
      TABLES.STORAGE_MARKETWATCHERS_TABLE,
      query
    );
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error
      },
      "Failed to load started marketwatchers"
    );
  }
};
/**
 * Find Marketwatcher
 *
 * @param {string} exchange - Marketwatcher exchange
 * @returns {Object}
 */
const findMarketwatcherByExchange = async exchange => {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        "exchange",
        TableUtilities.QueryComparisons.EQUAL,
        exchange
      )
    );
    const marketwatchers = await this.market.queryEntities(
      TABLES.STORAGE_MARKETWATCHERS_TABLE,
      query
    );
    if (marketwatchers.length > 0) return marketwatchers[0];
    return null;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error
      },
      "Failed to load started marketwatchers"
    );
  }
};

/**
 * Save Marketwatcher state
 *
 * @param {Object} state
 */
const saveMarketwatcherState = async state =>
  this.market.insertOrMergeEntity(TABLES.STORAGE_MARKETWATCHERS_TABLE, state);

/**
 * Delete Marketwatcher state
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deleteMarketwatcherState = async ({ RowKey, PartitionKey, metadata }) =>
  this.market.deleteEntity(TABLES.STORAGE_MARKETWATCHERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getMarketwatcherById,
  getStartedMarketwatchers,
  findMarketwatcherByExchange,
  saveMarketwatcherState,
  deleteMarketwatcherState
};
export default Object.values(TABLES);

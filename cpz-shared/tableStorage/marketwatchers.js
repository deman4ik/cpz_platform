import azure from "azure-storage";
import VError from "verror";
import { STORAGE_MARKETWATCHERS_TABLE } from "./tables";
import tableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;
tableStorage.createTableIfNotExists(STORAGE_MARKETWATCHERS_TABLE);

/**
 * Query Marketwatcher state by uniq id
 *
 * @param {Object} input
 * @param {string} input.taskId - Marketwatcher task id
 */
const getMarketwatcherById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_MARKETWATCHERS_TABLE, taskId);

/**
 * Finx Marketwatcher
 *
 * @param {Object} input
 * @param {string} input.mode - Marketwatcher mode
 * @param {string} input.exchange - Marketwatcher exchanges
 * @returns {MarketwatcherState}
 */
const findMarketwatcher = async ({ mode,  exchange }) => {
  try {
    const modeFilter = TableQuery.stringFilter(
      "mode",
      TableUtilities.QueryComparisons.EQUAL,
      mode
    );
    const exchangeFilter = TableQuery.stringFilter(
      "exchange",
      TableUtilities.QueryComparisons.EQUAL,
      exchange
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        modeFilter,
        TableUtilities.TableOperators.AND,
        exchangeFilter
      )
    );
    const marketwatchers = await tableStorage.queryEntities(
      STORAGE_MARKETWATCHERS_TABLE,
      query
    );

    if (marketwatchers.length > 0) return marketwatchers[0];
    return null;
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: { mode, providerType, exchange }
      },
      "Failed to read marketwatcher state"
    );
  }
};

/**
 * Save Marketwatcher state
 *
 * @param {MarketwatcherState} state
 */
const saveMarketwatcherState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_MARKETWATCHERS_TABLE, state);

/**
 * Delete Marketwatcher state
 *
 * @param {string} taskId
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteMarketwatcherState = async ({ RowKey, PartitionKey, metadata }) =>
  tableStorage.deleteEntity(STORAGE_MARKETWATCHERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getMarketwatcherById,
  findMarketwatcher,
  saveMarketwatcherState,
  deleteMarketwatcherState
};

import azure from "azure-storage";
import VError from "verror";
import { STATUS_STOPPED } from "../config/state";
import { STORAGE_MARKETWATCHERS_TABLE } from "./tables";
import TableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;

const tableStorage = new TableStorage(process.env.AZ_STORAGE_MARKET_CS);

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
 * Query Started Marketwatchers
 *
 * @returns {MarketwatcherState[]}
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
    return await tableStorage.queryEntities(
      STORAGE_MARKETWATCHERS_TABLE,
      query
    );
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error
      },
      "Failed to load started marketwatchers"
    );
  }
};
/**
 * Find Marketwatcher
 *
 * @param {Object} input
 * @param {string} input.exchange - Marketwatcher exchange
 * @returns {MarketwatcherState}
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
        cause: error
      },
      "Failed to load started marketwatchers"
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
  getStartedMarketwatchers,
  findMarketwatcherByExchange,
  saveMarketwatcherState,
  deleteMarketwatcherState
};

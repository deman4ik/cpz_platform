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
 * @param {string} input.hostId - Marketwacher host id
 */
const getMarketwatcherById = async ({ taskId, hostId }) => {
  try {
    const rowKeyFilter = TableQuery.stringFilter(
      "RowKey",
      TableUtilities.QueryComparisons.EQUAL,
      taskId
    );
    const hostIdFilter = TableQuery.stringFilter(
      "hostId",
      TableUtilities.QueryComparisons.EQUAL,
      hostId
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        rowKeyFilter,
        TableUtilities.TableOperators.AND,
        hostIdFilter
      )
    );
    return await tableStorage.queryEntities(
      STORAGE_MARKETWATCHERS_TABLE,
      query
    )[0];
  } catch (error) {
    throw new VError(
      {
        name: "MarketwatcherStorageError",
        cause: error,
        info: {
          taskId,
          hostId
        }
      },
      'Failed to read marketwatcher state "%s", "%s"',
      hostId,
      taskId
    );
  }
};

/**
 * Check if Marketwatcher exists
 *
 * @param {Object} input
 * @param {string} input.mode - Marketwatcher mode
 * @param {string} input.providerType - Marketwatcher provider type
 * @param {MarketwatcherSubscription[]} input.subscriptions - Marketwatcher subscriptions
 * @returns {boolean}
 */
const isMarketwatcherExists = async ({ mode, providerType, subscriptions }) => {
  try {
    const modeFilter = TableQuery.stringFilter(
      "mode",
      TableUtilities.QueryComparisons.EQUAL,
      mode
    );
    const providerTypeFilter = TableQuery.stringFilter(
      "providerType",
      TableUtilities.QueryComparisons.EQUAL,
      providerType
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        modeFilter,
        TableUtilities.TableOperators.AND,
        providerTypeFilter
      )
    );
    const marketwatchers = await tableStorage.queryEntities(
      STORAGE_MARKETWATCHERS_TABLE,
      query
    );
    if (marketwatchers.length === 0) return false;

    let exist = false;
    subscriptions.forEach(subscription => {
      marketwatchers.forEach(marketwatcher => {
        const dubles = marketwatcher.subscriptions.find(
          sub =>
            sub.exchange === subscription.exchange &&
            sub.asset === subscription.asset &&
            sub.currency === subscription.currency
        );
        exist = dubles.length > 0;
      });
    });
    return exist;
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: { mode, providerType, subscriptions }
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
  isMarketwatcherExists,
  saveMarketwatcherState,
  deleteMarketwatcherState
};

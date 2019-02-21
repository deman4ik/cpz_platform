import azure from "azure-storage";
import VError from "verror";
import { STATUS_STARTED, STATUS_BUSY } from "../config/state";
import { STORAGE_TRADERS_TABLE } from "./tables";
import TableStorage from "./tableStorage";
import { deletePositionsState } from "./positions";

const { TableQuery, TableUtilities } = azure;

const tableStorage = new TableStorage(process.env.AZ_STORAGE_TRADE_CS);

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
 * Find Trader
 *
 * @param {Object} input
 * @param {string} input.robotId - Robot Id
 * @param {string} input.userId - User Id
 * @returns {boolean}
 */
const findTrader = async ({ robotId, userId }) => {
  try {
    const robotIdFilter = TableQuery.stringFilter(
      "robotId",
      TableUtilities.QueryComparisons.EQUAL,
      robotId
    );
    const userIdFilter = TableQuery.stringFilter(
      "userId",
      TableUtilities.QueryComparisons.EQUAL,
      userId
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        userIdFilter,
        TableUtilities.TableOperators.AND,
        robotIdFilter
      )
    );
    const traders = await tableStorage.queryEntities(
      STORAGE_TRADERS_TABLE,
      query
    );
    if (traders.length > 0) return traders[0];
    return null;
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: { robotId, userId }
      },
      "Failed to read trader state"
    );
  }
};

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
        info: { slug }
      },
      'Failed to read traders by slug "%s"',
      slug
    );
  }
};

const getActiveTradersWithStopRequested = async () => {
  try {
    const startedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );
    const stopRequestedFilter = TableQuery.booleanFilter(
      "stopRequested",
      TableUtilities.QueryComparisons.EQUAL,
      true
    );

    const query = new TableQuery().where(
      TableQuery.combineFilters(
        startedStatusFilter,
        TableUtilities.TableOperators.AND,
        stopRequestedFilter
      )
    );
    return await tableStorage.queryEntities(STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TraderStorageError",
        cause: error
      },
      "Failed to read active traders with Stop requested"
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
    const traderState = await getTraderById(RowKey);
    if (traderState) {
      await deletePositionsState(RowKey);

      await tableStorage.deleteEntity(STORAGE_TRADERS_TABLE, {
        RowKey,
        PartitionKey,
        metadata
      });
    }
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
  findTrader,
  getActiveTradersBySlug,
  getActiveTradersWithStopRequested,
  saveTraderState,
  updateTraderState,
  deleteTraderState
};

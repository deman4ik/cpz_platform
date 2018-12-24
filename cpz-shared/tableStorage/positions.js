import azure from "azure-storage";
import VError from "verror";
import dayjs from "../utils/lib/dayjs";
import { POS_STATUS_OPEN, POS_STATUS_NEW } from "../config/state";
import { STORAGE_POSITIONS_TABLE } from "./tables";
import tableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;
tableStorage.createTableIfNotExists(STORAGE_POSITIONS_TABLE);

/**
 * Query Position state by uniq id
 *
 * @param {Object} input
 * @param {string} input.traderId - Trader task id
 * @param {string} input.positionId - Position id
 * @returns {PositionState}
 */
const getPositonById = async ({ traderId, positionId }) => {
  try {
    const rowKeyFilter = TableQuery.stringFilter(
      "RowKey",
      TableUtilities.QueryComparisons.EQUAL,
      positionId
    );
    const traderIdFilter = TableQuery.stringFilter(
      "traderId",
      TableUtilities.QueryComparisons.EQUAL,
      traderId
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        rowKeyFilter,
        TableUtilities.TableOperators.AND,
        traderIdFilter
      )
    );
    return await tableStorage.queryEntities(STORAGE_POSITIONS_TABLE, query)[0];
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: {
          traderId,
          positionId
        }
      },
      'Failed to read position state "%s", "%s"',
      traderId,
      positionId
    );
  }
};

/**
 * Query active positions
 *
 * @param {string} slug - partition key
 * @returns {PositionState[]}
 */
async function getActivePositionsBySlug(slug) {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const newStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      POS_STATUS_NEW
    );
    const openStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      POS_STATUS_OPEN
    );
    const statusFilter = TableQuery.combineFilters(
      newStatusFilter,
      TableUtilities.TableOperators.AND,
      openStatusFilter
    );

    const query = new TableQuery().where(
      TableQuery.combineFilters(
        partitionKeyFilter,
        TableUtilities.TableOperators.AND,
        statusFilter
      )
    );
    return await tableStorage.queryEntities(STORAGE_POSITIONS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: slug
      },
      'Failed to read active positions by slug "%s"',
      slug
    );
  }
}

async function getIdledOpenPositions() {
  try {
    const openStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      POS_STATUS_OPEN
    );
    const idleFilter = TableQuery.dateFilter(
      "Timestamp",
      TableUtilities.QueryComparisons.LESS_THAN,
      dayjs()
        .add(-1, "minute")
        .toDate()
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        idleFilter,
        TableUtilities.TableOperators.AND,
        openStatusFilter
      )
    );
    return await tableStorage.queryEntities(STORAGE_POSITIONS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error
      },
      "Failed to read idled open positions"
    );
  }
}

/**
 * Save Position state
 *
 * @param {PositionState} state
 */
const savePositionState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_POSITIONS_TABLE, state);

/**
 * Delete Position state
 *
 * @param {string} taskId
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deletePositionState = async ({ RowKey, PartitionKey, metadata }) =>
  tableStorage.deleteEntity(STORAGE_POSITIONS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });
/**
 * Delete all positions by Trader id
 *
 * @param {string} traderId - Trader id
 */
const deletePositionsState = async traderId => {
  try {
    const positions = await tableStorage.queryEntities(
      STORAGE_POSITIONS_TABLE,
      new TableQuery()
        .where(
          TableQuery.stringFilter(
            "traderId",
            TableUtilities.QueryComparisons.EQUAL,
            traderId
          )
        )
        .select("PartitionKey", "RowKey")
    );
    await tableStorage.deleteArray(STORAGE_POSITIONS_TABLE, positions);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: {
          traderId
        }
      },
      'Failed to delete Positions state by trader id: "%s"',
      traderId
    );
  }
};
export {
  getPositonById,
  getActivePositionsBySlug,
  getIdledOpenPositions,
  savePositionState,
  deletePositionState,
  deletePositionsState
};

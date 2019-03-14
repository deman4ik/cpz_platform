import azure from "azure-storage";
import ServiceError from "../../error";
import dayjs from "../../utils/lib/dayjs";
import { POS_STATUS_OPEN, POS_STATUS_NEW } from "../../config/state";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_POSITIONS_TABLE: "Positions"
};

/**
 * Query Position state by uniq id
 *
 * @param {Object} input
 *  @property {string} input.slug
 *  @property {string} input.traderId - Trader task id
 *  @property {string} input.positionId - Position id
 * @returns {Object} PositionState
 */
const getPosition = async ({ slug, traderId, positionId }) => {
  try {
    const rowKeyFilter = TableQuery.stringFilter(
      "RowKey",
      TableUtilities.QueryComparisons.EQUAL,
      positionId
    );
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const keysFilter = TableQuery.combineFilters(
      rowKeyFilter,
      TableUtilities.TableOperators.AND,
      partitionKeyFilter
    );
    const traderIdFilter = TableQuery.stringFilter(
      "traderId",
      TableUtilities.QueryComparisons.EQUAL,
      traderId
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        keysFilter,
        TableUtilities.TableOperators.AND,
        traderIdFilter
      )
    );
    const response = await this.client.queryEntities(
      TABLES.STORAGE_POSITIONS_TABLE,
      query
    );
    return response[0];
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
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
 * @returns {Object[]} Array of PositionState
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
      TableUtilities.TableOperators.OR,
      openStatusFilter
    );

    const query = new TableQuery().where(
      TableQuery.combineFilters(
        partitionKeyFilter,
        TableUtilities.TableOperators.AND,
        statusFilter
      )
    );
    return await this.client.queryEntities(
      TABLES.STORAGE_POSITIONS_TABLE,
      query
    );
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { slug }
      },
      'Failed to read active positions by slug "%s"',
      slug
    );
  }
}

/**
 * Query active positions by trader id
 *
 * @param {Object} input
 *  @property {string} input.slug - partition key
 *  @property {string} input.traderId - trader task id
 * @returns {Object[]} Array of PositionState
 */
async function getActivePositionsBySlugAndTraderId({ slug, traderId }) {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const traderIdFilter = TableQuery.stringFilter(
      "traderId",
      TableUtilities.QueryComparisons.EQUAL,
      traderId
    );
    const positionFilter = TableQuery.combineFilters(
      partitionKeyFilter,
      TableUtilities.TableOperators.AND,
      traderIdFilter
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
      TableUtilities.TableOperators.OR,
      openStatusFilter
    );

    const query = new TableQuery().where(
      TableQuery.combineFilters(
        positionFilter,
        TableUtilities.TableOperators.AND,
        statusFilter
      )
    );
    return await this.client.queryEntities(
      TABLES.STORAGE_POSITIONS_TABLE,
      query
    );
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { slug, traderId }
      },
      'Failed to read active positions by slug "%s" and traderId "%s"',
      slug,
      traderId
    );
  }
}

/**
 * Query Idled Open Positions
 */
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
      dayjs
        .utc()
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
    return await this.client.queryEntities(
      TABLES.STORAGE_POSITIONS_TABLE,
      query
    );
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error
      },
      "Failed to read idled open positions"
    );
  }
}

/**
 * Save Position state
 *
 * @param {Object} state
 */
const savePositionState = async state =>
  this.client.insertOrMergeEntity(TABLES.STORAGE_POSITIONS_TABLE, state);

/**
 * Delete Position state
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deletePositionState = async ({ RowKey, PartitionKey, metadata }) =>
  this.client.deleteEntity(TABLES.STORAGE_POSITIONS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

/**
 * Delete all positions by Trader id
 *
 * @param {string} traderId - Trader id
 */
const deletePositionsStateByTraderId = async traderId => {
  try {
    const positions = await this.client.queryEntities(
      TABLES.STORAGE_POSITIONS_TABLE,
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
    await this.client.deleteArray(TABLES.STORAGE_POSITIONS_TABLE, positions);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
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
  getPosition,
  getActivePositionsBySlug,
  getActivePositionsBySlugAndTraderId,
  getIdledOpenPositions,
  savePositionState,
  deletePositionState,
  deletePositionsStateByTraderId
};
export default Object.values(TABLES);

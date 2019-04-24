import azure from "azure-storage";
import client from "./index";
import Log from "../../log";
import ServiceError from "../../error";
import { STATUS_STARTED, STATUS_BUSY } from "../../config/state";
import dayjs from "../../utils/dayjs";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_TRADERS_TABLE: "Traders"
};
/**
 * Query trader by task id
 *
 * @param {string} taskId
 * @returns {Object}
 */
const getTraderById = async taskId =>
  client.getEntityByRowKey(TABLES.STORAGE_TRADERS_TABLE, taskId);

/**
 * Query traders by uniq keys
 *
 * @param {Object} input
 *  @property {string} RowKey
 *  @property {string} PartitionKey
 * @returns {Object[]}
 */
const getTraderByKeys = async ({ RowKey, PartitionKey }) =>
  client.getEntityByKeys(TABLES.STORAGE_TRADERS_TABLE, {
    RowKey,
    PartitionKey
  });

/**
 * Find Trader
 *
 * @param {Object} input
 *  @propery {string} input.robotId - Robot Id
 *  @propery {string} input.userId - User Id
 * @returns {Object}
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
    const traders = await client.queryEntities(
      TABLES.STORAGE_TRADERS_TABLE,
      query
    );
    if (traders.length > 0) return traders[0];
    return null;
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
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
 * @returns {Object[]}
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
    return await client.queryEntities(TABLES.STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { slug }
      },
      'Failed to read started, busy or stopping traders by slug "%s"',
      slug
    );
  }
};

/**
 * Query Traders
 *
 * @param {string} slug
 * @param {number} robotId
 * @returns {Object[]}
 */
const getTradersReadyForSignals = async ({ slug, robotId }) => {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const stopRequestedFilter = TableQuery.booleanFilter(
      "stopRequested",
      TableUtilities.QueryComparisons.EQUAL,
      false
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
    const robotIdFilter = TableQuery.doubleFilter(
      "robotId",
      TableUtilities.QueryComparisons.EQUAL,
      robotId
    );
    const statusFilter = TableQuery.combineFilters(
      startedStatusFilter,
      TableUtilities.TableOperators.OR,
      busyStatusFilter
    );

    const combinedOneFilters = TableQuery.combineFilters(
      partitionKeyFilter,
      TableUtilities.TableOperators.AND,
      robotIdFilter
    );
    const combinedTwoFilters = TableQuery.combineFilters(
      combinedOneFilters,
      TableUtilities.TableOperators.AND,
      stopRequestedFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        combinedTwoFilters,
        TableUtilities.TableOperators.AND,
        statusFilter
      )
    );
    return await client.queryEntities(TABLES.STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { slug, robotId }
      },
      'Failed to read started or busy traders by slug "%s" and robotId "%s"',
      slug,
      robotId
    );
  }
};

/**
 * Query started  Traders
 *
 * @returns {Object[]}
 */
const getStartedTraders = async () => {
  try {
    const startedStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );

    const query = new TableQuery().where(startedStatusFilter);
    return await client.queryEntities(TABLES.STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error
      },
      "Failed to read started or stopping traders"
    );
  }
};

/**
 * Query active Traders with active positions
 *
 * @returns {Object[]}
 */
const getIdledTradersWithActivePositions = async (seconds = 30) => {
  const idleTimestamp = dayjs
    .utc()
    .add(-seconds, "second")
    .toDate();
  try {
    const idleFilter = TableQuery.dateFilter(
      "Timestamp",
      TableUtilities.QueryComparisons.LESS_THAN,
      idleTimestamp
    );
    const hasActivePositionsFilter = TableQuery.booleanFilter(
      "hasActivePositions",
      TableUtilities.QueryComparisons.EQUAL,
      true
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
    const combinedFilter = TableQuery.combineFilters(
      hasActivePositionsFilter,
      TableUtilities.TableOperators.AND,
      idleFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        combinedFilter,
        TableUtilities.TableOperators.AND,
        statusFilter
      )
    );
    return await client.queryEntities(TABLES.STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { seconds, idleTimestamp }
      },
      "Failed to read traders with active positions"
    );
  }
};

/**
 * Save Trader state
 *
 * @param {Object} state
 */
const saveTraderState = async state =>
  client.insertOrMergeEntity(TABLES.STORAGE_TRADERS_TABLE, state);

/**
 * Update Trader state
 *
 * @param {Object} state
 */
const updateTraderState = async state =>
  client.mergeEntity(TABLES.STORAGE_TRADERS_TABLE, state);

/**
 * Delete Trader state with all Positions
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deleteTraderState = async ({ RowKey, PartitionKey, metadata }) =>
  client.deleteEntity(TABLES.STORAGE_TRADERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getTraderById,
  getTraderByKeys,
  findTrader,
  getActiveTradersBySlug,
  getTradersReadyForSignals,
  getStartedTraders,
  getIdledTradersWithActivePositions,
  saveTraderState,
  updateTraderState,
  deleteTraderState
};
export default Object.values(TABLES);

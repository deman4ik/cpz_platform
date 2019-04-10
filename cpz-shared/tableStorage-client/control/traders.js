import azure from "azure-storage";
import client from "./index";
import ServiceError from "../../error";
import { STATUS_STARTED, STATUS_STOPPING } from "../../config/state";
import dayjs from "../../utils/lib/dayjs";

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
    const stoppingStatusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STOPPING
    );
    const statusFilter = TableQuery.combineFilters(
      startedStatusFilter,
      TableUtilities.TableOperators.OR,
      stoppingStatusFilter
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
      'Failed to read traders by slug "%s"',
      slug
    );
  }
};

/**
 * Query started Traders
 *
 * @param {string} slug
 * @param {number} robotId
 * @returns {Object[]}
 */
const getStartedTradersBySlugAndRobotId = async ({ slug, robotId }) => {
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
    const robotIdFilter = TableQuery.doubleFilter(
      "robotId",
      TableUtilities.QueryComparisons.EQUAL,
      robotId
    );
    const combinedFilters = TableQuery.combineFilters(
      partitionKeyFilter,
      TableUtilities.TableOperators.AND,
      startedStatusFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        combinedFilters,
        TableUtilities.TableOperators.AND,
        robotIdFilter
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
      'Failed to read traders by slug "%s" and robotId "%s"',
      slug,
      robotId
    );
  }
};

/**
 * Query active Traders with active positions
 *
 * @returns {Object[]}
 */
const getIdledTradersWithActivePositions = async (minutes = 1) => {
  const idleTimestamp = dayjs
    .utc()
    .add(-minutes, "minute")
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
    const combinedFilter = TableQuery.combineFilters(
      hasActivePositionsFilter,
      TableUtilities.TableOperators.AND,
      startedStatusFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        idleFilter,
        TableUtilities.TableOperators.AND,
        combinedFilter
      )
    );
    return await client.queryEntities(TABLES.STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { minutes, idleTimestamp }
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
const deleteTraderState = async ({ RowKey, PartitionKey }) => {
  try {
    const traderState = await getTraderByKeys({ RowKey, PartitionKey });
    if (traderState && traderState.RowKey && traderState.PartitionKey) {
      await client.deleteEntity(TABLES.STORAGE_TRADERS_TABLE, {
        RowKey: traderState.RowKey,
        PartitionKey: traderState.PartitionKey
      });
    }
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
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
  getTraderByKeys,
  findTrader,
  getActiveTradersBySlug,
  getStartedTradersBySlugAndRobotId,
  getIdledTradersWithActivePositions,
  saveTraderState,
  updateTraderState,
  deleteTraderState
};
export default Object.values(TABLES);

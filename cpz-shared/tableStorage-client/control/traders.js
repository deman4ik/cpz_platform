import azure from "azure-storage";
import ServiceError from "../../error";
import { STATUS_STARTED, STATUS_BUSY } from "../../config/state";

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
  this.client.getEntityByRowKey(TABLES.STORAGE_TRADERS_TABLE, taskId);

/**
 * Query traders by uniq keys
 *
 * @param {Object} input
 *  @property {string} RowKey
 *  @property {string} PartitionKey
 * @returns {Object[]}
 */
const getTraderByKeys = async ({ RowKey, PartitionKey }) =>
  this.client.getEntityByKeys(TABLES.STORAGE_TRADERS_TABLE, {
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
    const traders = await this.client.queryEntities(
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
    return await this.client.queryEntities(TABLES.STORAGE_TRADERS_TABLE, query);
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
 * Query stop requested Traders
 * @returns {Object[]}
 */
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
    return await this.client.queryEntities(TABLES.STORAGE_TRADERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error
      },
      "Failed to read active traders with Stop requested"
    );
  }
};

/**
 * Save Trader state
 *
 * @param {Object} state
 */
const saveTraderState = async state =>
  this.client.insertOrMergeEntity(TABLES.STORAGE_TRADERS_TABLE, state);

/**
 * Update Trader state
 *
 * @param {Object} state
 */
const updateTraderState = async state =>
  this.client.mergeEntity(TABLES.STORAGE_TRADERS_TABLE, state);

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
      await this.client.deleteEntity(TABLES.STORAGE_TRADERS_TABLE, {
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
  getActiveTradersWithStopRequested,
  saveTraderState,
  updateTraderState,
  deleteTraderState
};
export default Object.values(TABLES);

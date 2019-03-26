import azure from "azure-storage";
import client from "./index";
import ServiceError from "../../error";
import { STATUS_STARTED, STATUS_STARTING } from "../../config/state";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_USERROBOTS_TABLE: "UserRobots"
};
/**
 * Query User Robot State by uniq  ID
 *
 * @param {string} id
 * @returns {Object}
 */
const getUserRobotById = async id =>
  client.getEntityByRowKey(TABLES.STORAGE_USERROBOTS_TABLE, id);

/**
 * Find User Robots by any service Id
 *
 * @param {Object} input
 *  @property {string} input.taskId Service taskId
 *  @property {string} input.serviceName Service Name
 * @returns {Object[]}
 */
const findUserRobotsByServiceId = async ({ taskId, serviceName }) => {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        `${serviceName}Id`,
        TableUtilities.QueryComparisons.EQUAL,
        taskId
      )
    );
    return await client.queryEntities(TABLES.STORAGE_USERROBOTS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { taskId, serviceName }
      },
      "Failed to read user robots state"
    );
  }
};

/**
 * Find Active User Robots by any service Id and exclude current user robot
 *
 * @param {object} input
 *  @property {string} input.userRobotId User Robot Id to exclude from query
 *  @property {string} input.taskId Service taskId
 *  @property {string} input.serviceName Service Name
 * @returns {Object[]}
 */
const findOtherActiveUserRobotsByServiceId = async ({
  userRobotId,
  taskId,
  serviceName
}) => {
  try {
    const serviceIdFilter = TableQuery.stringFilter(
      `${serviceName}Id`,
      TableUtilities.QueryComparisons.EQUAL,
      taskId
    );
    const rowKeyFilter = TableQuery.stringFilter(
      "RowKey",
      TableUtilities.QueryComparisons.NOT_EQUAL,
      userRobotId
    );
    const statusStartedFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );
    const statusStartingFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTING
    );
    const combinedFilters = TableQuery.combineFilters(
      serviceIdFilter,
      TableUtilities.TableOperators.AND,
      rowKeyFilter
    );
    const combinedStatusFilters = TableQuery.combineFilters(
      statusStartedFilter,
      TableUtilities.TableOperators.AND,
      statusStartingFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        combinedFilters,
        TableUtilities.TableOperators.AND,
        combinedStatusFilters
      )
    );
    return await client.queryEntities(TABLES.STORAGE_USERROBOTS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
        cause: error,
        info: { userRobotId, taskId, serviceName }
      },
      "Failed to read user robots state"
    );
  }
};
/**
 * Save User Robot state
 *
 * @param {Object} state
 */
const saveUserRobotState = async state =>
  client.insertOrMergeEntity(TABLES.STORAGE_USERROBOTS_TABLE, state);

/**
 * Delete User Robot state with trader
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deleteUserRobotState = async ({ RowKey, PartitionKey, metadata }) => {
  try {
    await client.deleteEntity(TABLES.STORAGE_USERROBOTS_TABLE, {
      RowKey,
      PartitionKey,
      metadata
    });
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
      "Failed to delete User Robot state"
    );
  }
};

export {
  getUserRobotById,
  findUserRobotsByServiceId,
  findOtherActiveUserRobotsByServiceId,
  saveUserRobotState,
  deleteUserRobotState
};
export default Object.values(TABLES);

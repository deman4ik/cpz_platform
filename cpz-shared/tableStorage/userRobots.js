import azure from "azure-storage";
import VError from "verror";
import { STATUS_STARTED, STATUS_STARTING } from "cpzState";
import { STORAGE_USERROBOTS_TABLE } from "./tables";
import tableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;
tableStorage.createTableIfNotExists(STORAGE_USERROBOTS_TABLE);

/**
 * Query User Robot State by uniq  ID
 *
 * @param {string} id
 * @returns {UserRobotState}
 */
const getUserRobotById = async id =>
  tableStorage.getEntityByRowKey(STORAGE_USERROBOTS_TABLE, id);

/**
 * Find User Robots by any service Id
 *
 * @param {object} input
 * @param {string} input.taskId Service taskId
 * @param {string} input.serviceName Service Name
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
    return await tableStorage.queryEntities(STORAGE_USERROBOTS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
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
 * @param {string} input.userRobotId User Robot Id to exclude from query
 * @param {string} input.taskId Service taskId
 * @param {string} input.serviceName Service Name
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
    return await tableStorage.queryEntities(STORAGE_USERROBOTS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
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
 * @param {UserRobotState} state
 */
const saveUserRobotState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_USERROBOTS_TABLE, state);

export {
  getUserRobotById,
  findUserRobotsByServiceId,
  findOtherActiveUserRobotsByServiceId,
  saveUserRobotState
};

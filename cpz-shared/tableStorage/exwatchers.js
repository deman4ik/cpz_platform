import azure from "azure-storage";
import VError from "verror";
import { STORAGE_EXWATCHERS_TABLE } from "./tables";
import TableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;

const tableStorage = new TableStorage(process.env.AZ_STORAGE_CONTROL_CS);

tableStorage.createTableIfNotExists(STORAGE_EXWATCHERS_TABLE);

/**
 * Query Exchange Data Watcher State by uniq ID
 *
 * @param {string} taskId
 * @returns {ExWatcherState}
 */
const getExWatcherById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_EXWATCHERS_TABLE, taskId);

/**
 * Find Exchange Data Watchers by any service Id
 *
 * @param {object} input
 * @param {string} input.taskId Service taskId
 * @param {string} input.serviceName Service Name
 */
const findExWatchersByServiceId = async ({ taskId, serviceName }) => {
  try {
    const query = new TableQuery().where(
      TableQuery.stringFilter(
        `${serviceName}Id`,
        TableUtilities.QueryComparisons.EQUAL,
        taskId
      )
    );
    return await tableStorage.queryEntities(STORAGE_EXWATCHERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: { taskId, serviceName }
      },
      "Failed to read exchange data watchers state"
    );
  }
};

/**
 * Find Exchange Data Watchers by any Importer Id
 *
 * @param {object} input
 * @param {string} input.taskId Importer taskId
 */
const findExWatchersByImporterId = async ({ taskId }) => {
  try {
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        TableQuery.stringFilter(
          `importerHistoryId`,
          TableUtilities.QueryComparisons.EQUAL,
          taskId
        ),
        TableUtilities.TableOperators.OR,
        TableQuery.stringFilter(
          `importerCurrentId`,
          TableUtilities.QueryComparisons.EQUAL,
          taskId
        )
      )
    );
    return await tableStorage.queryEntities(STORAGE_EXWATCHERS_TABLE, query);
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: { taskId }
      },
      "Failed to read exchange data watchers state"
    );
  }
};
/**
 * Save Exchange Data Watcher state
 *
 * @param {UserRobotState} state
 */
const saveExWatcherState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_EXWATCHERS_TABLE, state);

/**
 * Delete Exchange Data Watcher state
 *
 * @param {Object} input
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteExWatcherState = async ({ RowKey, PartitionKey, metadata }) =>
  tableStorage.deleteEntity(STORAGE_EXWATCHERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getExWatcherById,
  findExWatchersByServiceId,
  findExWatchersByImporterId,
  saveExWatcherState,
  deleteExWatcherState
};

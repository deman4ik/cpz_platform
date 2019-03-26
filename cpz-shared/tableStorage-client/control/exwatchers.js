import azure from "azure-storage";
import client from "./index";
import ServiceError from "../../error";

const { TableQuery, TableUtilities } = azure;

const TABLES = {
  STORAGE_EXWATCHERS_TABLE: "Exwatchers"
};

/**
 * Query Exchange Data Watcher State by uniq ID
 *
 * @param {string} taskId
 * @returns {Object}
 */
const getExWatcherById = async taskId =>
  client.getEntityByRowKey(TABLES.STORAGE_EXWATCHERS_TABLE, taskId);

/**
 * Find Exchange Data Watchers by any service Id
 *
 * @param {Object} input
 *  @property {string} input.taskId Service taskId
 *  @property {string} input.serviceName Service Name
 * @returns {Object[]}
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
    return await client.queryEntities(TABLES.STORAGE_EXWATCHERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
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
 * @param {Object} input
 *  @property {string} input.taskId Importer taskId
 * @returns {Object[]}
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
    return await client.queryEntities(TABLES.STORAGE_EXWATCHERS_TABLE, query);
  } catch (error) {
    throw new ServiceError(
      {
        name: ServiceError.types.TABLE_STORAGE_ERROR,
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
 * @param {Object} state
 */
const saveExWatcherState = async state =>
  client.insertOrMergeEntity(TABLES.STORAGE_EXWATCHERS_TABLE, state);

/**
 * Delete Exchange Data Watcher state
 *
 * @param {Object} input
 *  @property {string} input.RowKey
 *  @property {string} input.PartitionKey
 */
const deleteExWatcherState = async ({ RowKey, PartitionKey, metadata }) =>
  client.deleteEntity(TABLES.STORAGE_EXWATCHERS_TABLE, {
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
export default Object.values(TABLES);

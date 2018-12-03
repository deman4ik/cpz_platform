import azure from "azure-storage";
import VError from "verror";
import { STATUS_STARTED } from "../config/state";
import { STORAGE_IMPORTERS_TABLE } from "./tables";
import tableStorage from "./tableStorage";

const { TableQuery, TableUtilities } = azure;

tableStorage.createTableIfNotExists(STORAGE_IMPORTERS_TABLE);

/**
 * Query Importer state
 *
 * @param {string} taskId - Importer task id
 * @returns {ImporterState}
 */
const getImporterById = async taskId =>
  tableStorage.getEntityByRowKey(STORAGE_IMPORTERS_TABLE, taskId);

/**
 * Check if Importer exists
 *
 * @param {Object} input
 * @param {string} input.slug - Importer slug
 * @param {Date} input.dateFrom - import start date
 * @param {Date} input.dateTo - import end date
 * @return {boolean}
 */
const isActiveImporterExists = async ({ slug, dateFrom, dateTo }) => {
  try {
    const partitionKeyFilter = TableQuery.stringFilter(
      "PartitionKey",
      TableUtilities.QueryComparisons.EQUAL,
      slug
    );
    const statusFilter = TableQuery.stringFilter(
      "status",
      TableUtilities.QueryComparisons.EQUAL,
      STATUS_STARTED
    );
    const combinedFilter = TableQuery.combineFilters(
      partitionKeyFilter,
      TableUtilities.TableOperators.AND,
      statusFilter
    );
    const dateFromFilter = TableQuery.dateFilter(
      "dateFrom",
      TableUtilities.QueryComparisons.EQUAL,
      dateFrom
    );
    const dateToFilter = TableQuery.dateFilter(
      "dateTp",
      TableUtilities.QueryComparisons.EQUAL,
      dateTo
    );
    const dateFilter = TableQuery.combineFilters(
      dateFromFilter,
      TableUtilities.TableOperators.AND,
      dateToFilter
    );
    const query = new TableQuery().where(
      TableQuery.combineFilters(
        combinedFilter,
        TableUtilities.TableOperators.AND,
        dateFilter
      )
    );
    const importers = await tableStorage.queryEntities(
      STORAGE_IMPORTERS_TABLE,
      query
    );
    return importers.length > 0;
  } catch (error) {
    throw new VError(
      {
        name: "TableStorageError",
        cause: error,
        info: { slug, dateFrom, dateTo }
      },
      "Failed to read importer state"
    );
  }
};

/**
 * Save Importer state
 *
 * @param {ImporterState} state
 */
const saveImporterState = async state =>
  tableStorage.insertOrMergeEntity(STORAGE_IMPORTERS_TABLE, state);

/**
 * Update Importer State
 *
 * @param {ImporterState} state
 */
const updateImporterState = async state =>
  tableStorage.mergeEntity(STORAGE_IMPORTERS_TABLE, state);

/**
 * Delete Importer state
 *
 * @param {string} taskId
 * @param {string} input.RowKey
 * @param {string} input.PartitionKey
 */
const deleteImporterState = async ({ RowKey, PartitionKey, metadata }) =>
  tableStorage.deleteEntity(STORAGE_IMPORTERS_TABLE, {
    RowKey,
    PartitionKey,
    metadata
  });

export {
  getImporterById,
  isActiveImporterExists,
  saveImporterState,
  updateImporterState,
  deleteImporterState
};
